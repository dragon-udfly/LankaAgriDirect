import { useEffect, useState } from 'react';
import { getProducers, getProducerById } from '../api/adminApi';
import '../styles/NewRegistrations.css';

interface Producer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  nicNumber: string;
  profileImage?: string;
  nicPhotoUrl?: string;
  nicImageFront?: string;
  nicImageBack?: string;
  bankStatement?: string;
  registeredDate: string;
  status: string;
}

const NewRegistrationsPage = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadNewRegistrations();
  }, []);

  const loadNewRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProducers({ status: 'pending' });
      const rawProducers = res.data.data || res.data.content || [];
      // Map backend response to frontend Producer interface
      const mappedProducers = rawProducers.map((p: any) => ({
        id: p.id,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        email: p.email || '',
        phone: p.businessPhone || p.mobilePhone || '',
        location: p.homeAddress || p.district || '',
        nicNumber: p.nic || '',
        profileImage: p.profilePictureUrl,
        nicPhotoUrl: p.nicPhotoUrl,
        registeredDate: p.createdAt,
        status: p.verificationStatus,
      }));
      setProducers(mappedProducers.slice(0, 10)); // Limit to 10 latest registrations
    } catch (err: any) {
      setError(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const loadProducerDetails = async (producerId: string) => {
    try {
      const res = await getProducerById(producerId);
      const data = res.data.data || res.data;
      // Map backend response to frontend Producer interface
      const mappedProducer: Producer = {
        id: data.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email,
        phone: data.businessPhone || data.mobilePhone || '',
        location: data.homeAddress || data.district || '',
        nicNumber: data.nic,
        profileImage: data.profilePictureUrl,
        nicPhotoUrl: data.nicPhotoUrl,
        registeredDate: data.createdAt,
        status: data.verificationStatus,
      };
      setSelectedProducer(mappedProducer);
    } catch (err: any) {
      setError('Failed to load producer details');
    }
  };

  const handleSelectProducer = (producer: Producer) => {
    setSelectedProducer(producer);
    loadProducerDetails(producer.id);
  };

  const parseNicPhotos = (nicPhotoUrl?: string) => {
    if (!nicPhotoUrl) return { front: undefined, back: undefined };
    try {
      const parsed = JSON.parse(nicPhotoUrl);
      if (Array.isArray(parsed)) {
        return {
          front: parsed[0],
          back: parsed[1],
        };
      }
    } catch (e) {
      // If not valid JSON, treat it as a single URL (legacy format)
      return { front: nicPhotoUrl, back: undefined };
    }
    return { front: undefined, back: undefined };
  };

  const formatRegistrationDate = (dateValue?: any) => {
    if (!dateValue) return 'Not available';
    try {
      // Handle various date formats
      let date: Date;
      
      if (typeof dateValue === 'string') {
        // Remove timezone info if present and parse
        const cleanedDate = dateValue.replace('Z', '').split('.')[0];
        date = new Date(cleanedDate);
      } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date format';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return 'Invalid date format';
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner"><div className="loader" /></div>
      </div>
    );
  }

  return (
    <div className="page new-registrations-page">
      <div className="page-header">
        <h3>🆕 New User Registrations</h3>
        <p className="header-subtitle">Review and verify newly registered producers</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>✖</span> {error}
        </div>
      )}

      <div className="registrations-container">
        {/* Left Panel - List of Registrations */}
        <div className="registrations-list-panel">
          <div className="panel-header">
            <h4>📋 Pending Registrations ({producers.length})</h4>
          </div>

          {producers.length === 0 ? (
            <div className="empty-state">
              <p>✓ No pending registrations</p>
            </div>
          ) : (
            <div className="registrations-list">
              {producers.map(producer => (
                <div
                  key={producer.id}
                  className={`registration-card ${selectedProducer?.id === producer.id ? 'active' : ''}`}
                  onClick={() => handleSelectProducer(producer)}
                >
                  <div className="registration-card-header">
                    <h5>{producer.name}</h5>
                    <span className="registration-date">
                      {formatRegistrationDate(producer.registeredDate).split(',')[0]}
                    </span>
                  </div>
                  <div className="registration-card-info">
                    <p><strong>📧 Email:</strong> {producer.email}</p>
                    <p><strong>📱 Phone:</strong> {producer.phone}</p>
                    <p><strong>📍 Location:</strong> {producer.location}</p>
                  </div>
                  <div className="registration-card-footer">
                    <span className="badge badge-pending">Pending Review</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Image Gallery */}
        <div className="image-gallery-panel">
          {selectedProducer ? (
            <>
              <div className="panel-header">
                <h4>🖼️ Registration Documents</h4>
                <p className="header-subtitle">{selectedProducer.name}</p>
              </div>

              <div className="image-gallery">
                {/* Profile Image */}
                {selectedProducer.profileImage && (
                  <div className="gallery-item">
                    <div className="gallery-label">Profile Photo</div>
                    <div
                      className="gallery-thumbnail"
                      onClick={() =>
                        setSelectedImage({
                          url: selectedProducer.profileImage!,
                          title: 'Profile Photo',
                        })
                      }
                    >
                      <img src={selectedProducer.profileImage} alt="Profile" />
                      <div className="thumbnail-overlay">
                        <span>👁️ View</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* NIC Front */}
                {parseNicPhotos(selectedProducer.nicPhotoUrl).front && (
                  <div className="gallery-item">
                    <div className="gallery-label">NIC - Front</div>
                    <div
                      className="gallery-thumbnail"
                      onClick={() =>
                        setSelectedImage({
                          url: parseNicPhotos(selectedProducer.nicPhotoUrl).front!,
                          title: 'NIC - Front',
                        })
                      }
                    >
                      <img src={parseNicPhotos(selectedProducer.nicPhotoUrl).front} alt="NIC Front" />
                      <div className="thumbnail-overlay">
                        <span>👁️ View</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* NIC Back */}
                {parseNicPhotos(selectedProducer.nicPhotoUrl).back && (
                  <div className="gallery-item">
                    <div className="gallery-label">NIC - Back</div>
                    <div
                      className="gallery-thumbnail"
                      onClick={() =>
                        setSelectedImage({
                          url: parseNicPhotos(selectedProducer.nicPhotoUrl).back!,
                          title: 'NIC - Back',
                        })
                      }
                    >
                      <img src={parseNicPhotos(selectedProducer.nicPhotoUrl).back} alt="NIC Back" />
                      <div className="thumbnail-overlay">
                        <span>👁️ View</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Statement */}
                {selectedProducer.bankStatement && (
                  <div className="gallery-item">
                    <div className="gallery-label">Bank Statement</div>
                    <div
                      className="gallery-thumbnail"
                      onClick={() =>
                        setSelectedImage({
                          url: selectedProducer.bankStatement!,
                          title: 'Bank Statement',
                        })
                      }
                    >
                      <img src={selectedProducer.bankStatement} alt="Bank Statement" />
                      <div className="thumbnail-overlay">
                        <span>👁️ View</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Producer Details */}
              <div className="producer-details">
                <h5>📝 Producer Information</h5>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <p>{selectedProducer.name}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedProducer.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{selectedProducer.phone}</p>
                  </div>
                  <div className="detail-item">
                    <label>Location</label>
                    <p>{selectedProducer.location}</p>
                  </div>
                  <div className="detail-item">
                    <label>NIC Number</label>
                    <p>{selectedProducer.nicNumber}</p>
                  </div>
                  <div className="detail-item">
                    <label>Registration Date</label>
                    <p>{formatRegistrationDate(selectedProducer.registeredDate)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-gallery">
              <p>👈 Select a registration to view documents</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <div className="modal-close" onClick={() => setSelectedImage(null)}>
              ✕
            </div>
            <div className="modal-image-container">
              <img src={selectedImage.url} alt={selectedImage.title} />
            </div>
            <div className="modal-footer">
              <p>{selectedImage.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRegistrationsPage;
