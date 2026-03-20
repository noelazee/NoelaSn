'use client'

import { useState } from 'react'
import RegisterWorldID from './RegisterWorldID'
import FundingInstructions from './FundingInstructions'

export default function AgentOnboarding({ onRegistrationComplete, onFunded }) {
  const [step, setStep] = useState('worldid') // 'worldid' | 'funding' | 'complete'

  const handleWorldIDComplete = (data) => {
    console.log('[v0] World ID registration complete:', data)
    onRegistrationComplete(data)
  }

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
    }}>
      {step === 'worldid' && (
        <RegisterWorldID
          onComplete={handleWorldIDComplete}
          onNext={() => setStep('funding')}
        />
      )}
      {step === 'funding' && (
        <FundingInstructions onFunded={onFunded} onBack={() => setStep('worldid')} />
      )}
    </div>
  )
}
