import { useState } from "react"
import Card from "../common/Card"
import Button from "../common/Button"
import { Sparkles, Loader2, Sun, Moon, Clock, Info, AlertTriangle } from "lucide-react"
import { generateSkincareRoutine, type RoutineResponse } from "../../utils/geminiApi"

export default function RoutineGenerator() {
  const [skinType, setSkinType] = useState("")
  const [skinConcerns, setSkinConcerns] = useState<string[]>([])
  const [routineComplexity, setRoutineComplexity] = useState<'2-step' | '3-4-step' | 'more-than-4-step'>('3-4-step')
  const [isGenerating, setIsGenerating] = useState(false)
  const [routine, setRoutine] = useState<RoutineResponse | null>(null)
  const [error, setError] = useState("")

  const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"]
  const concerns = [
    "Acne", "Aging", "Dark Spots", "Dryness", "Oiliness", 
    "Sensitivity", "Large Pores", "Dullness", "Uneven Texture", "Dark Circles"
  ]

  const complexityOptions = [
    {
      value: '2-step' as const,
      label: '2-Step Routine',
      description: 'Simple and quick - perfect for beginners or busy schedules'
    },
    {
      value: '3-4-step' as const,
      label: '3-4 Step Routine',
      description: 'Balanced approach with essential products for most skin types'
    },
    {
      value: 'more-than-4-step' as const,
      label: 'More than 4 Steps',
      description: 'Comprehensive routine with targeted treatments and maximum results'
    }
  ]

  const toggleConcern = (concern: string) => {
    setSkinConcerns(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    )
  }

  const handleGenerateRoutine = async () => {
    if (!skinType || skinConcerns.length === 0) return;
    
    setIsGenerating(true);
    setError("");
    setRoutine(null);
    
    try {
      console.log('Generating routine for:', { skinType, skinConcerns, routineComplexity });
      const result = await generateSkincareRoutine(skinType, skinConcerns, routineComplexity);
      setRoutine(result);
    } catch (err: any) {
      console.error('Error generating routine:', err);
      setError(err.message || 'Failed to generate routine. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routine Generator</h1>
          <p className="text-gray-600 mt-1">Get a personalized skincare routine based on your skin type and concerns</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded inline-flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Generated
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Section */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Skin Profile</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Skin Type
                  </label>
                  <select
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select your skin type</option>
                    {skinTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Routine Complexity
                  </label>
                  <div className="space-y-3">
                    {complexityOptions.map(option => (
                      <label key={option.value} className="flex items-start cursor-pointer">
                        <input
                          type="radio"
                          name="complexity"
                          value={option.value}
                          checked={routineComplexity === option.value}
                          onChange={(e) => setRoutineComplexity(e.target.value as any)}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 mt-1"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Skin Concerns (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {concerns.map(concern => (
                      <label key={concern} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={skinConcerns.includes(concern)}
                          onChange={() => toggleConcern(concern)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{concern}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateRoutine}
                  disabled={!skinType || skinConcerns.length === 0 || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Routine
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700">
                        <p className="font-medium">Generation Failed</p>
                        <p className="mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Routine Display */}
        <div className="lg:col-span-2">
          {routine ? (
            <div className="space-y-6">
              {/* Morning Routine */}
              <Card className="border-0 shadow-md">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Sun className="w-5 h-5 mr-2 text-orange-500" />
                    <h2 className="text-xl font-semibold">Morning Routine</h2>
                    <span className="ml-auto text-sm text-gray-500">
                      {routine.morning_routine.length} steps
                    </span>
                  </div>
                  <div className="space-y-4">
                    {routine.morning_routine.map((step, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${step.optional ? 'border-orange-200 bg-orange-50' : 'border-orange-200 bg-orange-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <h3 className="font-medium text-orange-800">
                              Step {step.step}: {step.product_type}
                            </h3>
                            {step.optional && (
                              <span className="ml-2 px-2 py-1 text-xs bg-orange-200 text-orange-700 rounded">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-orange-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {step.timing}
                          </div>
                        </div>
                        <p className="text-sm text-orange-700 mb-2">
                          <strong>Product:</strong> {step.product_name}
                        </p>
                        <p className="text-sm text-orange-700 mb-2">
                          <strong>Instructions:</strong> {step.instructions}
                        </p>
                        <p className="text-sm text-orange-600">
                          <strong>Benefits:</strong> {step.benefits}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Evening Routine */}
              <Card className="border-0 shadow-md">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Moon className="w-5 h-5 mr-2 text-indigo-500" />
                    <h2 className="text-xl font-semibold">Evening Routine</h2>
                    <span className="ml-auto text-sm text-gray-500">
                      {routine.evening_routine.length} steps
                    </span>
                  </div>
                  <div className="space-y-4">
                    {routine.evening_routine.map((step, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${step.optional ? 'border-indigo-200 bg-indigo-50' : 'border-indigo-200 bg-indigo-50'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <h3 className="font-medium text-indigo-800">
                              Step {step.step}: {step.product_type}
                            </h3>
                            {step.optional && (
                              <span className="ml-2 px-2 py-1 text-xs bg-indigo-200 text-indigo-700 rounded">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-indigo-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {step.timing}
                          </div>
                        </div>
                        <p className="text-sm text-indigo-700 mb-2">
                          <strong>Product:</strong> {step.product_name}
                        </p>
                        <p className="text-sm text-indigo-700 mb-2">
                          <strong>Instructions:</strong> {step.instructions}
                        </p>
                        <p className="text-sm text-indigo-600">
                          <strong>Benefits:</strong> {step.benefits}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Enhanced Tips and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <Info className="w-5 h-5 mr-2 text-blue-500" />
                      <h3 className="font-semibold text-blue-800">General Tips</h3>
                    </div>
                    <p className="text-sm text-blue-700">{routine.general_tips}</p>
                  </div>
                </Card>

                <Card className="border-0 shadow-md">
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <Clock className="w-5 h-5 mr-2 text-green-500" />
                      <h3 className="font-semibold text-green-800">Frequency Notes</h3>
                    </div>
                    <p className="text-sm text-green-700">{routine.frequency_notes}</p>
                  </div>
                </Card>

                <Card className="border-0 shadow-md">
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                      <h3 className="font-semibold text-purple-800">Weekly Schedule</h3>
                    </div>
                    <p className="text-sm text-purple-700">{routine.weekly_schedule}</p>
                  </div>
                </Card>

                <Card className="border-0 shadow-md">
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <Info className="w-5 h-5 mr-2 text-teal-500" />
                      <h3 className="font-semibold text-teal-800">Product Recommendations</h3>
                    </div>
                    <p className="text-sm text-teal-700">{routine.product_recommendations}</p>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <div className="p-12 text-center">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Generate Your Routine
                </h3>
                <p className="text-gray-600">
                  Select your skin type, concerns, and preferred routine complexity to get a personalized skincare routine
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}