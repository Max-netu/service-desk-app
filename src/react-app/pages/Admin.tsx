import { useState, useEffect } from 'react';
import Layout from '@/react-app/components/Layout';
import { 
  Plus, 
  Users, 
  MapPin, 
  Monitor,
  BarChart3,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { Location, Machine } from '@/shared/types';

export default function Admin() {
  
  const [activeTab, setActiveTab] = useState<'locations' | 'machines' | 'users' | 'reports'>('locations');
  const [locations, setLocations] = useState<Location[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationForm, setLocationForm] = useState({ name: '', address: '' });

  useEffect(() => {
    fetchLocations();
    fetchMachines();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines');
      const data = await response.json();
      setMachines(data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationForm)
      });
      
      if (response.ok) {
        fetchLocations();
        setLocationForm({ name: '', address: '' });
        setShowLocationForm(false);
      }
    } catch (error) {
      console.error('Error creating location:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'locations' as const, name: 'Lokacije', icon: MapPin },
    { id: 'machines' as const, name: 'Automati', icon: Monitor },
    { id: 'users' as const, name: 'Korisnici', icon: Users },
    { id: 'reports' as const, name: 'Izvještaji', icon: BarChart3 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administracija</h1>
          <p className="mt-2 text-gray-600">Upravljanje sustavom i korisnicima</p>
        </div>

        {/* Tabs */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upravljanje lokacijama</h2>
                <button
                  onClick={() => setShowLocationForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova lokacija</span>
                </button>
              </div>

              {/* Location Form */}
              {showLocationForm && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <form onSubmit={handleCreateLocation} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Naziv lokacije *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Unesite naziv lokacije"
                          value={locationForm.name}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresa
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Unesite adresu"
                          value={locationForm.address}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowLocationForm(false)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        Odustani
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Spremam...' : 'Spremi'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Locations List */}
              <div className="space-y-3">
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      {location.address && (
                        <p className="text-sm text-gray-600">{location.address}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {locations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nema dodanih lokacija</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Machines Tab */}
          {activeTab === 'machines' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upravljanje automatima</h2>
                <button
                  onClick={() => {/* TODO: Implement machine form */}}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novi automat</span>
                </button>
              </div>

              {/* Machines List */}
              <div className="space-y-3">
                {machines.map((machine) => (
                  <div key={machine.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{machine.machine_id}</h3>
                      <p className="text-sm text-gray-600">
                        {(machine as any).location_name}
                        {machine.model && ` • ${machine.model}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {machines.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nema dodanih automata</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upravljanje korisnicima</h2>
              </div>

              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Upravljanje korisnicima će biti implementirano u budućoj verziji</p>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Izvještaji i analitika</h2>
              </div>

              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Izvještaji i analitika će biti implementirani u budućoj verziji</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
