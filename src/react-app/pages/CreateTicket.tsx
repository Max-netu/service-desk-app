import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { 
  Location, 
  Machine, 
  CreateTicket as CreateTicketType, 
  UrgencyLabels,
  TicketUrgency
} from '@/shared/types';

export default function CreateTicket() {
  const navigate = useNavigate();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateTicketType>({
    location_id: 0,
    machine_id: '',
    title: '',
    description: '',
    urgency: 'srednja' as TicketUrgency
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (formData.location_id) {
      fetchMachines(formData.location_id);
    } else {
      setMachines([]);
    }
  }, [formData.location_id]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchMachines = async (locationId: number) => {
    try {
      const response = await fetch(`/api/machines?location_id=${locationId}`);
      const data = await response.json();
      setMachines(data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri stvaranju prijave');
      }

      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Neočekivana greška');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateTicketType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-300 hover:text-white hover:bg-blue-800/30 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Nova prijava</h1>
            <p className="text-gray-300">Prijavite kvar ili problem s automatom</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-800/30 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Lokacija *
              </label>
              <select
                className="w-full px-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 text-gray-900"
                value={formData.location_id}
                onChange={(e) => handleInputChange('location_id', parseInt(e.target.value))}
                required
              >
                <option value={0}>Odaberite lokaciju</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Machine */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                ID automata *
              </label>
              {machines.length > 0 ? (
                <select
                  className="w-full px-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 text-gray-900"
                  value={formData.machine_id}
                  onChange={(e) => handleInputChange('machine_id', e.target.value)}
                  required
                >
                  <option value="">Odaberite automat</option>
                  {machines.map((machine) => (
                    <option key={machine.id} value={machine.machine_id}>
                      {machine.machine_id} {machine.model && `(${machine.model})`}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 text-gray-900"
                  placeholder="Unesite ID automata"
                  value={formData.machine_id}
                  onChange={(e) => handleInputChange('machine_id', e.target.value)}
                  required
                />
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Naslov problema *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 text-gray-900"
                placeholder="Kratki opis problema"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                minLength={5}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Detaljni opis problema *
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 resize-none text-gray-900"
                placeholder="Opišite problem što detaljnije moguće..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                minLength={10}
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Razina hitnosti *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(UrgencyLabels).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.urgency === value
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                        : 'border-blue-700 bg-white/90 text-gray-700 hover:border-blue-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={value}
                      checked={formData.urgency === value}
                      onChange={(e) => handleInputChange('urgency', e.target.value as TicketUrgency)}
                      className="sr-only"
                    />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* File Upload Placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Priložite datoteke (opcionalno)
              </label>
              <div className="border-2 border-dashed border-blue-600 rounded-xl p-8 text-center bg-white/5">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-2">Povucite datoteke ovdje ili kliknite za odabir</p>
                <p className="text-sm text-gray-400">PNG, JPG, MP4 do 10MB</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  // File upload functionality would be implemented here
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 text-gray-300 hover:text-white hover:bg-blue-800/30 rounded-xl transition-colors duration-200 font-medium"
              >
                Odustani
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Stvaram prijavu...' : 'Stvori prijavu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
