import MessagesInboxClient from "@/components/Messages/MessagesInboxClient";

export const metadata = {
  title: "Messages",
  description:
    "View and respond to conversations with clients and freelancers on SkillBridge.",
};

export default function MessagesPage() {
  return <MessagesInboxClient />;
}
