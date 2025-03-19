'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentConfig {
  name: string
  seedPhrase: string
  endpoint: string
  personality: string
}

interface AgentDeploymentProps {
  agent: {
    name: string
    desc: string
    logo: string
  }
}

const PERSONALITIES = [
  { value: 'elon', label: 'Elon Musk' },
  { value: 'saylor', label: 'Michael Saylor' },
  { value: 'cz', label: 'CZ' }
]

export default function AgentDeployment({ agent }: AgentDeploymentProps) {
  const [numAgents, setNumAgents] = useState<string>("1")
  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      name: "agent-1",
      seedPhrase: "*".repeat(16),
      endpoint: "http://localhost:8000/submit",
      personality: "elon"
    }
  ])

  const handleNumAgentsChange = (value: string) => {
    setNumAgents(value)
    const num = parseInt(value)
    const newAgents: AgentConfig[] = []
    
    for (let i = 0; i < num; i++) {
      newAgents.push({
        name: `agent-${i + 1}`,
        seedPhrase: "*".repeat(16),
        endpoint: `http://localhost:${8000 + i}/submit`,
        personality: PERSONALITIES[i % PERSONALITIES.length].value
      })
    }
    setAgents(newAgents)
  }

  const handlePersonalityChange = (value: string, index: number) => {
    const newAgents = [...agents]
    newAgents[index] = { ...newAgents[index], personality: value }
    setAgents(newAgents)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Agent Configuration</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Number of Agents</Label>
            <Select value={numAgents} onValueChange={handleNumAgentsChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Agent</SelectItem>
                <SelectItem value="2">2 Agents</SelectItem>
                <SelectItem value="3">3 Agents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {agents.map((agentConfig, index) => (
            <Card key={index} className="mt-4 p-4">
              <h4 className="mb-3 font-medium">Agent {index + 1}</h4>
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={agentConfig.name}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Personality</Label>
                  <Select 
                    value={agentConfig.personality} 
                    onValueChange={(value) => handlePersonalityChange(value, index)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select personality" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONALITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Seed Phrase</Label>
                  <Input 
                    value={agentConfig.seedPhrase}
                    type="password"
                    disabled
                    className="cursor-not-allowed bg-muted"
                  />
                </div>
                <div>
                  <Label>Endpoint</Label>
                  <Input 
                    value={agentConfig.endpoint}
                    readOnly
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Runtime Requirements</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Python</p>
            <p className="font-medium">3.8+</p>
          </div>
          <div>
            <p className="text-muted-foreground">RAM</p>
            <p className="font-medium">512MB</p>
          </div>
          <div>
            <p className="text-muted-foreground">Storage</p>
            <p className="font-medium">100MB</p>
          </div>
        </div>
      </Card>

      <Button className="w-full" disabled>
        Deploy Agents
      </Button>
    </div>
  )
} 