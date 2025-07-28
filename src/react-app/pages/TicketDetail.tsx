import { useState, useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useParams, useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import { 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  Clock, 
  User,
  MapPin,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { 
  Ticket, 
  TicketComment,
  StatusLabels, 
  UrgencyLabels, 
  StatusColors, 
  UrgencyColors,
  TicketStatus
} from '@/shared/types';

export default function TicketDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const userData = user;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTicket();
      fetchComments();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${id}`);
      if (!response.ok) throw new Error('Ticket not found');
      const data = await response.json();
      setTicket(data);
    } catch (error) {
      setError('Greška pri dohvaćanju prijave');
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/tickets/${id}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: newComment.trim(),
          is_internal: isInternal
        })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setNewComment('');
      setIsInternal(false);
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      const response = await fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      fetchTicket();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignToSelf = async () => {
    if (!userData) return;
    
    try {
      const response = await fetch(`/api/tickets/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technician_id: userData.id })
      });

      if (!response.ok) throw new Error('Failed to assign ticket');
      
      fetchTicket();
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

  if (error || !ticket) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Greška</h1>
          <p className="text-gray-600 mb-6">{error || 'Prijava nije pronađena'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            Povratak na glavnu
          </button>
        </div>
      </Layout>
    );
  }

  const canChangeStatus = userData?.role !== 'korisnik';
  const canAssign = userData?.role === 'tehnicar' && !ticket.technician_id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{ticket.ticket_number}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${StatusColors[ticket.status]}`}>
                {StatusLabels[ticket.status]}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${UrgencyColors[ticket.urgency]}`}>
                {UrgencyLabels[ticket.urgency]}
              </span>
            </div>
            <h2 className="text-xl text-gray-700">{ticket.title}</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalji prijave</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    <span className="font-medium">Lokacija:</span> {(ticket as any).location_name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    <span className="font-medium">Automat:</span> {ticket.machine_id}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    <span className="font-medium">Prijavio:</span> {(ticket as any).user_name || (ticket as any).user_email}
                  </span>
                </div>
                
                {(ticket as any).technician_name && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      <span className="font-medium">Tehničar:</span> {(ticket as any).technician_name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    <span className="font-medium">Datum prijave:</span> {new Date(ticket.created_at).toLocaleString('hr-HR')}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Opis problema</h4>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Komentari ({comments.length})
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      comment.is_internal 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {(comment as any).user_name}
                        </span>
                        {comment.is_internal && (
                          <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                            Interno
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleString('hr-HR')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Nema komentara</p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleSubmitComment} className="border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 resize-none"
                    placeholder="Dodajte komentar..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />

                  <div className="flex items-center justify-between">
                    {userData?.role !== 'korisnik' && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Interni komentar</span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingComment ? 'Šalje...' : 'Pošalji'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Akcije</h3>
              
              <div className="space-y-3">
                {canAssign && (
                  <button
                    onClick={handleAssignToSelf}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    Preuzmi prijavu
                  </button>
                )}

                {canChangeStatus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promijeni status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    >
                      {Object.entries(StatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kronologija</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Prijava kreirana</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.created_at).toLocaleString('hr-HR')}
                    </p>
                  </div>
                </div>
                
                {ticket.updated_at !== ticket.created_at && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Zadnja promjena</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.updated_at).toLocaleString('hr-HR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
