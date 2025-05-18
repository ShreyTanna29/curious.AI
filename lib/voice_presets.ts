export const VOICE_PRESETS = {
  male: [
    {
      id: "Deep_Voice_Man",
      name: "Deep Voice Man",
      description: "Deep and resonant male voice",
      gender: "male",
    },
    {
      id: "Casual_Guy",
      name: "Casual Guy",
      description: "Relaxed and friendly male voice",
      gender: "male",
    },
    {
      id: "Patient_Man",
      name: "Patient Man",
      description: "Calm and composed male voice",
      gender: "male",
    },
    {
      id: "Young_Knight",
      name: "Young Knight",
      description: "Energetic and noble male voice",
      gender: "male",
    },
    {
      id: "Determined_Man",
      name: "Determined Man",
      description: "Strong and resolute male voice",
      gender: "male",
    },
    {
      id: "Decent_Boy",
      name: "Decent Boy",
      description: "Polite and well-mannered male voice",
      gender: "male",
    },
    {
      id: "Imposing_Manner",
      name: "Imposing Manner",
      description: "Commanding and authoritative male voice",
      gender: "male",
    },
    {
      id: "Elegant_Man",
      name: "Elegant Man",
      description: "Sophisticated and refined male voice",
      gender: "male",
    },
  ],
  female: [
    {
      id: "Wise_Woman",
      name: "Wise Woman",
      description: "Mature and knowledgeable female voice",
      gender: "female",
    },
    {
      id: "Friendly_Person",
      name: "Friendly Person",
      description: "Warm and approachable female voice",
      gender: "female",
    },
    {
      id: "Inspirational_girl",
      name: "Inspirational Girl",
      description: "Motivating and uplifting female voice",
      gender: "female",
    },
    {
      id: "Calm_Woman",
      name: "Calm Woman",
      description: "Peaceful and soothing female voice",
      gender: "female",
    },
    {
      id: "Lively_Girl",
      name: "Lively Girl",
      description: "Energetic and vibrant female voice",
      gender: "female",
    },
    {
      id: "Lovely_Girl",
      name: "Lovely Girl",
      description: "Sweet and charming female voice",
      gender: "female",
    },
    {
      id: "Sweet_Girl_2",
      name: "Sweet Girl",
      description: "Gentle and pleasant female voice",
      gender: "female",
    },
    {
      id: "Exuberant_Girl",
      name: "Exuberant Girl",
      description: "Enthusiastic and cheerful female voice",
      gender: "female",
    },
    {
      id: "Abbess",
      name: "Abbess",
      description: "Dignified and composed female voice",
      gender: "female",
    },
  ],
} as const;

export type VoiceGender = keyof typeof VOICE_PRESETS;
export type VoicePreset = (typeof VOICE_PRESETS)[VoiceGender][number]["id"];
