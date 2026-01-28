import { useState } from 'react';

export default function AddSepoliaManually() {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      background: 'rgba(245, 158, 11, 0.1)',
      border: '2px solid #f59e0b',
      borderRadius: '12px',
      color: '#f59e0b',
    }}>
      <h3 style={{ marginTop: 0 }}>🔗 Ajouter Sepolia manuellement</h3>
      
      <p style={{ margin: '0 0 16px 0' }}>
        Si Sepolia ne s'ajoute pas automatiquement, vous pouvez l'ajouter manuellement à Metamask :
      </p>

      <button
        onClick={() => setShowInstructions(!showInstructions)}
        style={{
          background: 'transparent',
          border: '1px solid #f59e0b',
          color: '#f59e0b',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: '16px',
        }}
      >
        {showInstructions ? '▼ Masquer les instructions' : '▶ Afficher les instructions'}
      </button>

      {showInstructions && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
        }}>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px' }}>
              Ouvrez <strong>Metamask</strong>
            </li>
            <li style={{ marginBottom: '12px' }}>
              Cliquez sur le bouton <strong>réseau</strong> en haut à gauche
            </li>
            <li style={{ marginBottom: '12px' }}>
              Cliquez sur <strong>"Ajouter un réseau"</strong>
            </li>
            <li style={{ marginBottom: '12px' }}>
              Sélectionnez <strong>"Ajouter manuellement"</strong>
            </li>
            <li style={{ marginBottom: '12px' }}>
              Remplissez les champs suivants :
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '8px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Nom du réseau :</strong> Sepolia Test Network
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>URL RPC :</strong> https://rpc.sepolia.org
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>ID de chaîne :</strong> 11155111
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Symbole de devise :</strong> ETH
                </div>
                <div>
                  <strong>URL de l'explorateur :</strong> https://sepolia.etherscan.io
                </div>
              </div>
            </li>
            <li>
              Cliquez sur <strong>"Enregistrer"</strong>
            </li>
          </ol>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            color: '#10b981',
          }}>
            ✓ Une fois ajouté, Metamask basculera automatiquement vers Sepolia
          </div>
        </div>
      )}

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        color: '#3b82f6',
        fontSize: '0.9rem',
      }}>
        💡 <strong>Astuce :</strong> Vous pouvez aussi utiliser{' '}
        <a 
          href="https://chainlist.org/?search=sepolia" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3b82f6', textDecoration: 'underline' }}
        >
          chainlist.org
        </a>
        {' '}pour ajouter le réseau automatiquement
      </div>
    </div>
  );
}
