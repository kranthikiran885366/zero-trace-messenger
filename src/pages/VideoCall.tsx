import { useParams } from 'react-router-dom';
import VideoCallInterface from '@/components/VideoCallInterface';

const VideoCall = () => {
  const { roomId } = useParams();
  
  return <VideoCallInterface />;
};

export default VideoCall;