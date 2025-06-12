import React, { useState } from 'react';

const AIAssistant = ({ suggestions }) => {
  const [activeTab, setActiveTab] = useState('relationships');

  return (
    <div className="ai-assistant">
      <div className="tabs">
        <button 
          className={activeTab === 'relationships' ? 'active' : ''}
          onClick={() => setActiveTab('relationships')}
        >
          Relasi
        </button>
        <button 
          className={activeTab === 'entities' ? 'active' : ''}
          onClick={() => setActiveTab('entities')}
        >
          Entitas
        </button>
        <button 
          className={activeTab === 'actions' ? 'active' : ''}
          onClick={() => setActiveTab('actions')}
        >
          Aksi
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'relationships' && (
          <div className="relationship-suggestions">
            <h4>Saran Relasi AI</h4>
            {suggestions.relationships && suggestions.relationships.length > 0 ? (
              <ul>
                {suggestions.relationships.map((rel, index) => (
                  <li key={index} className="suggestion-item">
                    <span className="subject">{rel.subject}</span>
                    <span className="predicate">{rel.predicate}</span>
                    <span className="object">{rel.object}</span>
                    <button className="add-button">+ Tambah</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">Tidak ada saran relasi. Ketik ide untuk memproses.</p>
            )}
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="entity-suggestions">
            <h4>Entitas Terdeteksi</h4>
            {suggestions.entities && suggestions.entities.length > 0 ? (
              <div className="entity-tags">
                {suggestions.entities.map((entity, index) => (
                  <span key={index} className="entity-tag">
                    {entity.word} ({entity.entity_group})
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-state">Tidak ada entitas terdeteksi</p>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="ai-actions">
            <h4>Otomasi AI</h4>
            <button className="action-button">
              🔍 Temukan Node Terkait
            </button>
            <button className="action-button">
              🧠 Sarankan Node Baru
            </button>
            <button className="action-button">
              📊 Analisis Cluster
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;