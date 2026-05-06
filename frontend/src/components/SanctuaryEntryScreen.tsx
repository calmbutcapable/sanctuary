type SanctuaryEntryScreenProps = {
  onEnter: () => void;
};

export default function SanctuaryEntryScreen({ onEnter }: SanctuaryEntryScreenProps) {
  return (
    <main className="entry-container">
      <div className="entry-card">
        <div className="entry-logo-wrap">
            <img src="/logo-white.png" alt="Calm But Capable" className="entry-logo" />
        </div>


            <h1 className="entry-title">Sanctuary</h1>

        <p className="entry-tagline">
          Calm but capable. Let’s begin.
        </p>

        <p className="entry-subtitle">
          Move forward at your pace.
        </p>

        <button className="entry-button" onClick={onEnter}>
          Enter Sanctuary
        </button>
      </div>
    </main>
  );
}