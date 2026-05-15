import { useState, useEffect } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Loader2, ArrowLeft, Download, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';

export function AIDocumentGenerator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState('');
  const [documentType, setDocumentType] = useState<'bol' | 'invoice'>('bol');
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [availableLoads, setAvailableLoads] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Get all bookings and loads
    const bookings = JSON.parse(localStorage.getItem('load_bookings') || '[]');
    const allLoads = JSON.parse(localStorage.getItem('posted_loads') || '[]');

    // Filter bookings for this user based on their role
    let userBookings = [];

    if (user.role === 'carrier') {
      // Carrier: show loads assigned to them
      userBookings = bookings.filter((b: any) =>
        b.carrierId === user.id &&
        ['booked', 'assigned', 'picked-up', 'delivered'].includes(b.status)
      );
    } else {
      // Broker/Dealer: show loads they posted that have been assigned
      const userLoadIds = allLoads
        .filter((l: any) => l.userId === user.id || l.brokerId === user.id)
        .map((l: any) => l.id);

      userBookings = bookings.filter((b: any) =>
        userLoadIds.includes(b.loadId) &&
        ['booked', 'assigned', 'picked-up', 'delivered'].includes(b.status)
      );
    }

    // Match bookings to loads and combine the data
    const loadsWithBookings = userBookings.map((booking: any) => {
      const load = allLoads.find((l: any) => l.id === booking.loadId);
      if (!load) return null;

      return {
        ...load,
        booking,
        // Add carrier info to the load for document generation
        assignedCarrierId: booking.carrierId,
        carrierName: booking.carrierName,
        carrierEmail: booking.carrierEmail,
        carrierPhone: booking.carrierPhone,
        bookingStatus: booking.status,
        // Ensure userId is set (for finding broker profile in backend)
        userId: load.userId || load.brokerId
      };
    }).filter(Boolean); // Remove any loads that weren't found

    console.log('📄 Available loads for documents:', loadsWithBookings);
    setAvailableLoads(loadsWithBookings);
  }, [user]);

  const handleGenerate = async () => {
    if (!selectedLoad) {
      toast.error('Please select a load');
      return;
    }

    setIsLoading(true);
    try {
      const load = availableLoads.find(l => l.id === selectedLoad);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-generate-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            load,
            documentType,
            userId: user?.id
          })
        }
      );

      if (!response.ok) throw new Error('Failed to generate document');

      const data = await response.json();
      setGeneratedDocument(data);
      toast.success(`${documentType.toUpperCase()} generated successfully!`);
    } catch (error) {
      console.error('Document generation error:', error);
      toast.error('Failed to generate document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedDocument) return;
    
    // Create downloadable version
    const content = generatedDocument.content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDocument.filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document downloaded!');
  };

  return (
    <div className="min-h-screen bg-background relative">
      <MapBackground />

      <div className="relative z-10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/ai-tools')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to AI Tools
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-none bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <FileText className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">BOL & Invoice Generator</h1>
              <p className="text-muted-foreground">AI-powered professional document creation</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Document Settings</CardTitle>
                <CardDescription>Select load and document type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bol">Bill of Lading (BOL)</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Select Load</label>
                  <Select value={selectedLoad} onValueChange={setSelectedLoad}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a load..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLoads.map((load) => (
                        <SelectItem key={load.id} value={load.id}>
                          Order #{load.orderId} - {load.pickupCity}, {load.pickupState} → {load.deliveryCity}, {load.deliveryState}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableLoads.length === 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-none text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">No loads available for documents</p>
                    <p className="text-amber-700 dark:text-amber-300">
                      {user?.role === 'carrier'
                        ? "You need an assigned load to generate documents. Accept a load from the load board first."
                        : "You need to assign a carrier to one of your posted loads before generating documents."}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleGenerate}
                  disabled={isLoading || !selectedLoad}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="size-4 mr-2" />
                      Generate {documentType.toUpperCase()}
                    </>
                  )}
                </Button>

                {/* Features List */}
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-3">AI Features:</div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {[
                      'Professional formatting',
                      'Automatic data population',
                      'Legal compliance',
                      'Customizable templates',
                      'Instant generation'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="size-4 text-teal-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {generatedDocument ? (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-teal-700 dark:text-teal-400">
                        {documentType === 'bol' ? 'Bill of Lading' : 'Invoice'}
                      </CardTitle>
                      <Button 
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    </div>
                    <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-none border-2 border-gray-200 dark:border-gray-700 font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                      {generatedDocument.content}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Document Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Document ID:</span>
                      <span className="font-medium">{generatedDocument.documentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date(generatedDocument.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-green-600">Ready</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center border-2 border-dashed min-h-[600px]">
                <CardContent className="text-center py-12">
                  <FileText className="size-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground mb-2">No document generated yet</p>
                  <p className="text-sm text-muted-foreground">
                    Select a load and click generate to create a document
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}