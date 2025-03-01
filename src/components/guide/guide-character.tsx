import Image from 'next/image'
import { cn } from '@/lib/utils'

type GuideEmotion = 'happy' | 'thinking' | 'explaining' | 'surprised' | 'excited' | 'curious' | 'enthusiastic'

interface GuideCharacterProps {
  emotion: GuideEmotion
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function GuideCharacter({ 
  emotion, 
  className,
  size = 'md' 
}: GuideCharacterProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  // Emoji für die verschiedenen Emotionen
  const emotionEmoji = {
    happy: '😊',
    thinking: '🤔',
    explaining: '👩‍🏫',
    surprised: '😮',
    excited: '🤩',
    curious: '🧐',
    enthusiastic: '🤓'
  }

  return (
    <div className={cn(
      `relative rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center ${sizeClasses[size]}`,
      className
    )}>
      <div className="text-3xl">
        {emotionEmoji[emotion]}
      </div>
    </div>
  )
}