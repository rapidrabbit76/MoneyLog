import { useEffect, useState } from 'react';
import { loadingMessages } from '@/lib/loading-messages';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card 컴포넌트 import
import { Progress } from "@/components/ui/progress"; // Progress 컴포넌트 import

interface LoadingPopupProps {
  isOpen: boolean;
}

const LoadingPopup: React.FC<LoadingPopupProps> = ({ isOpen }) => {
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isOpen) {
      // 메시지 변경 로직
      const changeMessage = () => {
        const randomIndex = Math.floor(Math.random() * loadingMessages.length);
        setMessage(loadingMessages[randomIndex]);
      };
      changeMessage(); // 초기 메시지 설정
      messageInterval = setInterval(changeMessage, Math.random() * 1000 + 1000); // 1~2초 간격으로 메시지 변경

      // 프로그레스 바 로직 (예시: 10초 동안 100%까지 증가)
      setProgress(0);
      const startTime = Date.now();
      progressInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const calculatedProgress = Math.min((elapsedTime / 10000) * 100, 100); // 10초 기준
        setProgress(calculatedProgress);
        if (calculatedProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);

      return () => {
        clearInterval(messageInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background text-foreground">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">잠시만 기다려주세요...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          <p className="text-lg text-center min-h-[50px]">{message}</p>
          <Progress value={progress} className="w-full h-3" />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingPopup;
