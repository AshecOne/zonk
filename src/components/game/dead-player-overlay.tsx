interface DeadPlayerOverlayProps {
    playerName: string;
  }
  
  export const DeadPlayerOverlay: React.FC<DeadPlayerOverlayProps> = ({ playerName }) => {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-2xl font-bold mb-2">{playerName}</h3>
          <p className="text-xl">Anda Mati</p>
        </div>
      </div>
    );
  };