import React, { useEffect, useState } from "react";
import { JournalEntry } from "../api/client";

type JournalsViewProps = {
  journalText: string;
  setJournalText: (value: string) => void;
  handleCreateJournal: () => Promise<void>;
  handleUpdateJournal: () => Promise<void>;
  handleCancelEditJournal: () => void;
  journalSaving: boolean;
  journalError: string | null;
  journalEntries: JournalEntry[];
  handleDeleteJournal: (id: string) => void;
  handleStartEditJournal: (entry: JournalEntry) => void;
  editingJournalId: string | null;
  writingColumn: React.CSSProperties;
  inputStyles: React.CSSProperties;
};

export default function JournalsView({
  journalText,
  setJournalText,
  handleCreateJournal,
  handleUpdateJournal,
  journalSaving,
  journalError,
  journalEntries,
  handleDeleteJournal,
  handleStartEditJournal,
  handleCancelEditJournal,
  editingJournalId,
  writingColumn,
  inputStyles,
}: JournalsViewProps) {
  const [isWriting, setIsWriting] = useState(false);

useEffect(() => {
  if (editingJournalId) {
    setIsWriting(true);
  }
}, [editingJournalId]);

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Journal</h2>
      <p style={{ opacity: 0.8, fontSize: "1.1rem" }}>
  Your notes appear here as you capture them during your sessions.
</p>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >

       <div style={writingColumn}>
  {isWriting && (
    <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
      <div style={{ fontWeight: 600 }}>
        {editingJournalId ? "Edit journal entry" : "New journal entry"}
      </div>

      <textarea
        className="sanctuary-textarea"
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
        placeholder={
          editingJournalId
            ? "Update your journal entry here…"
            : "Type your journal entry here…"
        }
        rows={6}
        style={{ ...inputStyles, resize: "vertical" }}
      />

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={async () => {
            try {
              if (editingJournalId) {
                await handleUpdateJournal();
              } else {
                await handleCreateJournal();
              }
              setIsWriting(false);
                setJournalText("");
                handleCancelEditJournal();
              } catch {
              // keep editor open if save fails
            }
          }}
          disabled={journalSaving || journalText.trim().length === 0}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "none",
            background: "#2b6cb0",
            color: "white",
            cursor: "pointer",
          }}
        >
          {journalSaving
            ? editingJournalId
              ? "Updating…"
              : "Saving…"
            : editingJournalId
              ? "Update entry"
              : "Save entry"}
        </button>

        <button
          onClick={() => {
            setIsWriting(false);
            setJournalText("");
            handleCancelEditJournal();
          }}
          type="button"
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "1px solid #555",
            background: "transparent",
            color: "#bbb",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        
        {journalError && (
          <span style={{ fontSize: 14, opacity: 0.9 }}>
            {journalError}
          </span>
        )}
      </div>
    </div>
  )}
</div>
        <h3 style={{ marginTop: "0.5rem" }}>Recent journal entries</h3>

        {journalEntries.length === 0 ? (
  <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>
  No notes captured yet. They will appear here as you reflect during your sessions.
</p>
) : (
  [...journalEntries]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((entry) => (
      <JournalCard
        key={entry.id}
        entry={entry}
        onDelete={handleDeleteJournal}
        onEdit={handleStartEditJournal}
      />
    ))
)}
      </div>
      
    </section>
  );
}

function JournalCard({
  entry,
  onDelete,
  onEdit,
}: {
  entry: JournalEntry;
  onDelete?: (id: string) => void;
  onEdit?: (entry: JournalEntry) => void;
}) {
  const createdDate = new Date(entry.created_at);
  const updatedDate = new Date(entry.updated_at);
  const wasEdited = entry.updated_at !== entry.created_at;

  return (
    <article
      style={{
        padding: "0.75rem 1rem",
        borderRadius: 8,
        border: "1px solid #222",
        background: "#111",
      }}
    >
      <div
            style={{
              fontSize: "1.1rem",
              opacity: 0.6,
              marginBottom: "0.35rem",
              display: "grid",
              gap: 4,
      }}
>
  <div>Created: {createdDate.toLocaleString()}</div>
  {wasEdited && <div>Last edited: {updatedDate.toLocaleString()}</div>}
</div>

      <div style={{ fontSize: "1.1rem", whiteSpace: "pre-wrap" }}>
        {entry.content}
      </div>

      {(onEdit || onDelete) && (
  <div
    style={{
      marginTop: "0.75rem",
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.5rem",
    }}
  >
    {onEdit && (
      <button
        onClick={() => onEdit(entry)}
        style={{
          padding: "0.25rem 0.6rem",
          borderRadius: 999,
          border: "1px solid #555",
          background: "transparent",
          color: "#bbb",
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
      >
        Edit entry
      </button>
    )}

    {onDelete && (
      <button
        onClick={() => onDelete(entry.id)}
        style={{
          padding: "0.25rem 0.6rem",
          borderRadius: 999,
          border: "1px solid #555",
          background: "transparent",
          color: "#bbb",
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    )}
  </div>
)}
    </article>
  );
}