export interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
}
