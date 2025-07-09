import { useParams } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';

const Chat = () => {
  const { roomId } = useParams();
  
  return <ChatInterface />;
};

export default Chat;