import { useState, useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Link } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { 
  Plus, 
  Filter, 
  Search, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { 
  Ticket, 
  StatusLabels, 
  UrgencyLabels, 
  StatusColors, 
  UrgencyColors,
  TicketStatus,
  TicketUrgency
} from '@/shared/types';

export default function Dashboard() {
  const { user } = useAuth();
  const userData = user;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [urgencyFilter, setUrgencyFilter] = useState<TicketUrgency | ''>('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, urgencyFilter]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (urgencyFilter) params.append('urgency', urgencyFilter);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.machine_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStats = () => {
    return {
      nova: tickets.filter(t => t.status === 'nova').length,
      u_tijeku: tickets.filter(t => t.status === 'u_tijeku').length,
      cekanje_porezne: tickets.filter(t => t.status === 'cekanje_porezne').length,
    };
  };

  const stats = getStatusStats();

  const handleAssignTicket = async (ticketId: number) => {
    if (!userData) return;
    
    try {
      await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technician_id: userData.id })
      });
      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Nadzorna ploča</h1>
            <p className="mt-2 text-gray-300">
              Dobrodošli, {userData?.full_name || userData?.email}
            </p>
          </div>
          
          {userData?.role === 'korisnik' && (
            <Link
              to="/create-ticket"
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Nova prijava</span>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-800/30">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Nove prijave</p>
                <p className="text-2xl font-bold text-white">{stats.nova}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-800/30">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">U tijeku</p>
                <p className="text-2xl font-bold text-white">{stats.u_tijeku}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-800/30">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Čekanje porezne</p>
                <p className="text-2xl font-bold text-white">{stats.cekanje_porezne}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-800/30">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pretraži po broju prijave, naslovu ili ID automata..."
                  className="w-full pl-10 pr-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="px-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 text-gray-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
              >
                <option value="">Svi statusi</option>
                {Object.entries(StatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <select
                className="px-4 py-3 border border-blue-700 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/90 text-gray-900"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as TicketUrgency | '')}
              >
                <option value="">Sve razine hitnosti</option>
                {Object.entries(UrgencyLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-800/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-800/50">
            <h2 className="text-xl font-semibold text-white">
              Prijave ({filteredTickets.length})
            </h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-lg text-gray-300 mb-2">Nema prijava</p>
              <p className="text-gray-400">
                {searchTerm || statusFilter || urgencyFilter 
                  ? 'Pokušajte promijeniti filtere pretraživanja'
                  : 'Trenutno nema aktivnih prijava'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-blue-800/30">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-white/5 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-blue-600">{ticket.ticket_number}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${StatusColors[ticket.status]}`}>
                          {StatusLabels[ticket.status]}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${UrgencyColors[ticket.urgency]}`}>
                          {UrgencyLabels[ticket.urgency]}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-white mb-1">{ticket.title}</h3>
                      
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Lokacija: {(ticket as any).location_name}</p>
                        <p>Automat: {ticket.machine_id}</p>
                        <p>Kreirao: {(ticket as any).user_name || (ticket as any).user_email}</p>
                        {(ticket as any).technician_name && (
                          <p>Tehničar: {(ticket as any).technician_name}</p>
                        )}
                        <p>Datum: {new Date(ticket.created_at).toLocaleDateString('hr-HR')}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {userData?.role === 'tehnicar' && !ticket.technician_id && (
                        <button
                          onClick={() => handleAssignTicket(ticket.id)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 font-medium"
                        >
                          Preuzmi
                        </button>
                      )}
                      
                      <Link
                        to={`/ticket/${ticket.id}`}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-yellow-400 hover:bg-blue-800/30 rounded-lg transition-colors duration-200 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Prikaži</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
