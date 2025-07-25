import { useState } from "react"
import Card from "../common/Card"
import Button from "../common/Button"
import { Search, Loader2, Info, AlertTriangle, CheckCircle, Star, Award, Shield } from "lucide-react"
import { analyzeIngredient, type IngredientAnalysis } from "../../utils/geminiApi"

export default function IngredientChecker() {
  const [ingredient, setIngredient] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null)
  const [error, setError] = useState("")

  const popularIngredients = [
    "Hyaluronic Acid", "Niacinamide", "Retinol", "Vitamin C", "Salicylic Acid",
    "Glycolic Acid", "Ceramides", "Peptides", "Alpha Arbutin", "Azelaic Acid",
    "Caffeine", "Kojic Acid"
  ]

  const recentSearches = ["Hyaluronic Acid", "Niacinamide", "Retinol", "Vitamin C"]

  const handleAnalyzeIngredient = async () => {
    if (!ingredient.trim()) return;
    
    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);
    
    try {
      console.log('Analyzing ingredient:', ingredient);
      const result = await analyzeIngredient(ingredient);
      setAnalysis(result);
    } catch (err: any) {
      console.error('Error analyzing ingredient:', err);
      setError(err.message || 'Failed to analyze ingredient. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    if (rating >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 8) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (rating >= 6) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (rating >= 4) return { text: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ingredient Checker</h1>
          <p className="text-gray-600 mt-1">Analyze skincare ingredients for safety and effectiveness</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded inline-flex items-center">
            <Search className="w-3 h-3 mr-1" />
            AI-Powered Analysis
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analysis Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Analyze Ingredient</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ingredient Name
                  </label>
                  <div className="flex space-x-2">
                    <input
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Hyaluronic Acid, Niacinamide, Retinol..."
                      value={ingredient}
                      onChange={(e) => setIngredient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeIngredient()}
                    />
                    <Button
                      onClick={handleAnalyzeIngredient}
                      disabled={!ingredient.trim() || isAnalyzing}
                      className="bg-gradient-to-r from-teal-500 to-blue-600"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Analysis Failed</p>
                      <p className="mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card className="border-0 shadow-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Analysis Results for "{ingredient}"</h2>
                    <div className="flex items-center mt-2 space-x-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(analysis.rating / 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className={`font-semibold ${getRatingColor(analysis.rating)}`}>
                          {analysis.rating}/10
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingBadge(analysis.rating).color}`}>
                        {getRatingBadge(analysis.rating).text}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {analysis.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-6 h-6 text-blue-500" />
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <h3 className="font-medium text-green-800">Benefits & Effects</h3>
                      </div>
                      <p className="text-sm text-green-700 leading-relaxed">{analysis.benefits}</p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Info className="w-5 h-5 text-blue-500 mr-2" />
                        <h3 className="font-medium text-blue-800">How to Use</h3>
                      </div>
                      <p className="text-sm text-blue-700 leading-relaxed">{analysis.how_to_use}</p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Info className="w-5 h-5 text-purple-500 mr-2" />
                        <h3 className="font-medium text-purple-800">Mechanism of Action</h3>
                      </div>
                      <p className="text-sm text-purple-700 leading-relaxed">{analysis.mechanism_of_action}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                        <h3 className="font-medium text-orange-800">Safety & Usage Limits</h3>
                      </div>
                      <p className="text-sm text-orange-700 leading-relaxed">{analysis.safety_usage_limit}</p>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <h3 className="font-medium text-red-800">Potential Side Effects</h3>
                      </div>
                      <p className="text-sm text-red-700 leading-relaxed">{analysis.side_effects}</p>
                    </div>

                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="w-5 h-5 text-teal-500 mr-2" />
                        <h3 className="font-medium text-teal-800">Suitable Skin Types</h3>
                      </div>
                      <p className="text-sm text-teal-700 leading-relaxed">{analysis.suitable_skin_types}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Professional Summary</h3>
                  <p className="text-sm text-gray-700">
                    This {analysis.category.toLowerCase()} has received a rating of {analysis.rating}/10 based on its 
                    efficacy, safety profile, and scientific backing. 
                    {analysis.rating >= 7 && " This ingredient is well-researched and generally considered safe and effective for most users."}
                    {analysis.rating >= 4 && analysis.rating < 7 && " This ingredient shows promise but may require careful use or have limited research."}
                    {analysis.rating < 4 && " This ingredient may have safety concerns or limited efficacy data."}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Ingredients */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Ingredients</h3>
              <div className="space-y-2">
                {popularIngredients.map((ing, index) => (
                  <button
                    key={index}
                    onClick={() => setIngredient(ing)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">{ing}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Searches */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setIngredient(search)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Enhanced Safety Tips */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Safety Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Shield className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Always patch test new ingredients on a small skin area first</span>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Start with lower concentrations and gradually increase</span>
                </div>
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Check for ingredient interactions with current products</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Consult a dermatologist for persistent skin concerns</span>
                </div>
                <div className="flex items-start">
                  <Search className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Read product labels carefully for concentration levels</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Rating Guide */}
          <Card className="border-0 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Rating Guide</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-medium">8-10: Excellent</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-600 font-medium">6-7: Good</span>
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                    <Star className="w-3 h-3 text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-medium">4-5: Fair</span>
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                    {[...Array(2)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-gray-300" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-medium">1-3: Poor</span>
                  <div className="flex">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-gray-300" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}