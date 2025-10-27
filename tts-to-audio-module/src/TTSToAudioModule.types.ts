// Puedes dejar este archivo vacío por ahora
// o borrar los tipos que no uses como:
// export type OnLoadEventPayload = { ... };
// export type TTSToAudioViewProps = { ... };

// Solo deja esto, si planeas usar eventos
export type ChangeEventPayload = {
  value: string;
};

export type TTSToAudioModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};