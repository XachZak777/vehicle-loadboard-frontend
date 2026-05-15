import { useState } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Route, 
  MapPin, 
  Fuel,
  FileText,
  Bell,
  MessageSquare,
  BarChart3,
  TrendingDown,
  Users,
  ShieldAlert,
  Star,
  Zap,
  Brain,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

interface AITool {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'pricing' | 'routing' | 'document' | 'insights' | 'security' | 'support';
  path: string;
  color: string;
  gradient: string;
}

const aiTools: AITool[] = [
  {
    id: 'price-suggestions',
    title: 'Dynamic Price Suggestions',
    description: 'AI-powered pricing recommendations based on route, demand, season, and historical data',
    icon: DollarSign,
    category: 'pricing',
    path: '/ai-tools/pricing',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'revenue-forecast',
    title: 'Revenue Forecasting',
    description: 'Predict monthly earnings based on your routes, acceptance patterns, and market trends',
    icon: TrendingUp,
    category: 'pricing',
    path: '/ai-tools/revenue-forecast',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'route-optimizer',
    title: 'Multi-Load Route Optimizer',
    description: 'Find the most efficient sequence for multiple loads to minimize deadhead miles',
    icon: Route,
    category: 'routing',
    path: '/ai-tools/route-optimizer',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'backhaul',
    title: 'Backhaul Recommendations',
    description: 'Smart suggestions for return loads to eliminate empty miles and maximize profit',
    icon: MapPin,
    category: 'routing',
    path: '/ai-tools/backhaul',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'fuel-calculator',
    title: 'Fuel Cost Calculator',
    description: 'Real-time fuel cost estimation with route optimization to save money',
    icon: Fuel,
    category: 'routing',
    path: '/ai-tools/fuel-calculator',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'document-generator',
    title: 'BOL & Invoice Generator',
    description: 'Automatically generate professional bills of lading and invoices using AI',
    icon: FileText,
    category: 'document',
    path: '/ai-tools/documents',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'market-alerts',
    title: 'Market Intelligence Alerts',
    description: 'Real-time notifications about high-demand routes and above-average rates',
    icon: Bell,
    category: 'insights',
    path: '/ai-tools/market-alerts',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'ai-chat',
    title: 'AI Support Assistant',
    description: '24/7 AI chatbot to answer questions, guide users, and explain platform policies',
    icon: MessageSquare,
    category: 'support',
    path: '/ai-tools/chat-support',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'performance',
    title: 'Performance Dashboard',
    description: 'AI-generated insights about your acceptance rate, earnings, and market position',
    icon: BarChart3,
    category: 'insights',
    path: '/ai-tools/performance',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'market-reports',
    title: 'Market Intelligence Reports',
    description: 'Weekly AI-generated summaries of trends, hot lanes, and rate changes',
    icon: TrendingDown,
    category: 'insights',
    path: '/ai-tools/market-reports',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'compatibility',
    title: 'Compatibility Score',
    description: 'AI predicts how well carriers and brokers will work together based on history',
    icon: Users,
    category: 'insights',
    path: '/ai-tools/compatibility',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    id: 'fraud-detection',
    title: 'Anomaly Detection',
    description: 'AI flags suspicious posting patterns, unusual pricing, and potential fraud',
    icon: ShieldAlert,
    category: 'security',
    path: '/ai-tools/fraud-detection',
    color: 'text-orange-600',
    gradient: 'from-orange-600 to-orange-500'
  },
  {
    id: 'rating-verification',
    title: 'Rating Authenticity',
    description: 'Detect fake or manipulated reviews to ensure trust and credibility',
    icon: Star,
    category: 'security',
    path: '/ai-tools/rating-verification',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500'
  }
];

const categories = [
  { id: 'all', name: 'All Tools', icon: Sparkles },
  { id: 'pricing', name: 'Pricing & Revenue', icon: DollarSign },
  { id: 'routing', name: 'Routing & Logistics', icon: Route },
  { id: 'document', name: 'Documents', icon: FileText },
  { id: 'insights', name: 'Analytics & Insights', icon: BarChart3 },
  { id: 'security', name: 'Security & Trust', icon: ShieldAlert },
  { id: 'support', name: 'Support', icon: MessageSquare }
];

export function AITools() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = activeCategory === 'all' 
    ? aiTools 
    : aiTools.filter(tool => tool.category === activeCategory);

  const handleLaunchTool = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <MapBackground />

      <div className="relative z-10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20 mb-6">
            <Brain className="size-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Powered by Advanced AI
            </span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
            AI Tools Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Harness the power of artificial intelligence to optimize your transportation business, 
            increase profits, and make smarter decisions.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-3 justify-center"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category.id)}
                className={`gap-2 transition-all ${
                  activeCategory === category.id 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30' 
                    : 'hover:border-amber-500'
                }`}
              >
                <Icon className="size-4" />
                {category.name}
              </Button>
            );
          })}
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-amber-500/30 relative overflow-hidden group">
                  {/* Animated gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-none bg-gradient-to-br ${tool.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="size-6 text-white" />
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleLaunchTool(tool.path)}
                      className={`w-full bg-gradient-to-r ${tool.gradient} text-white hover:shadow-lg hover:scale-105 transition-all duration-200 gap-2 group/btn`}
                    >
                      <Zap className="size-4" />
                      Launch Tool
                      <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {aiTools.length}
              </CardTitle>
              <CardDescription>AI-Powered Tools</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                24/7
              </CardTitle>
              <CardDescription>Always Available</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                Instant
              </CardTitle>
              <CardDescription>Real-time Results</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  );
}