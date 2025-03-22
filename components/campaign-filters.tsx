"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function CampaignFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [status, setStatus] = useState(searchParams.get("status") || "active")
  const [minFunding, setMinFunding] = useState(Number(searchParams.get("minFunding") || "0"))
  const [nearlyFunded, setNearlyFunded] = useState(searchParams.get("nearlyFunded") === "true")
  const [endingSoon, setEndingSoon] = useState(searchParams.get("endingSoon") === "true")
  
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (category !== "all") params.set("category", category)
    if (status !== "all") params.set("status", status)
    if (minFunding > 0) params.set("minFunding", minFunding.toString())
    if (nearlyFunded) params.set("nearlyFunded", "true")
    if (endingSoon) params.set("endingSoon", "true")
    
    router.push(`/campaigns?${params.toString()}`)
  }
  
  const resetFilters = () => {
    setCategory("all")
    setStatus("active")
    setMinFunding(0)
    setNearlyFunded(false)
    setEndingSoon(false)
    router.push("/campaigns")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Category</Label>
          <RadioGroup value={category} onValueChange={setCategory}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">All Categories</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="technology" id="technology" />
              <Label htmlFor="technology" className="cursor-pointer">Technology</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="education" id="education" />
              <Label htmlFor="education" className="cursor-pointer">Education</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="environment" id="environment" />
              <Label htmlFor="environment" className="cursor-pointer">Environment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="health" id="health" />
              <Label htmlFor="health" className="cursor-pointer">Health</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="community" id="community" />
              <Label htmlFor="community" className="cursor-pointer">Community</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="art" id="art" />
              <Label htmlFor="art" className="cursor-pointer">Art & Culture</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-3">
          <Label>Status</Label>
          <RadioGroup value={status} onValueChange={setStatus}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all" className="cursor-pointer">All Statuses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active" className="cursor-pointer">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed" className="cursor-pointer">Completed</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Minimum Funding</Label>
            <span className="text-sm">{minFunding} ETH</span>
          </div>
          <Slider
            value={[minFunding]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={(value) => setMinFunding(value[0])}
          />
        </div>
        
        <div className="space-y-3">
          <Label>Additional Filters</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="nearly-funded" checked={nearlyFunded} onCheckedChange={(checked) => setNearlyFunded(checked === true)} />
              <Label htmlFor="nearly-funded" className="cursor-pointer">Nearly Funded (&gt;80%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ending-soon" checked={endingSoon} onCheckedChange={(checked) => setEndingSoon(checked === true)} />
              <Label htmlFor="ending-soon" className="cursor-pointer">Ending Soon (&lt;7 days)</Label>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}

