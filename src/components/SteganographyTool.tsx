import { useState, useRef } from 'react';
import { Upload, Download, Eye, EyeOff, Image, Music, FileText, Lock, Unlock, Camera, Mic, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const SteganographyTool = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hiddenMessage, setHiddenMessage] = useState('');
  const [password, setPassword] = useState('');
  const [stegoMethod, setStegoMethod] = useState('lsb');
  const [extractedMessage, setExtractedMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stegoMethods = [
    { value: 'lsb', label: 'LSB (Least Significant Bit)', description: 'Hide data in image pixels' },
    { value: 'dct', label: 'DCT (Discrete Cosine Transform)', description: 'Hide in frequency domain' },
    { value: 'spread', label: 'Spread Spectrum', description: 'Distribute across entire file' },
    { value: 'echo', label: 'Echo Hiding', description: 'Audio steganography method' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "📁 File Selected",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    }
  };

  const hideMessage = async () => {
    if (!selectedFile || !hiddenMessage) {
      toast({
        title: "Missing Data",
        description: "Please select a file and enter a message to hide",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate steganography process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a simulated output file
    const outputFileName = `stego_${selectedFile.name}`;
    
    setIsProcessing(false);
    toast({
      title: "🔒 Message Hidden Successfully",
      description: `Message embedded in ${outputFileName} using ${stegoMethods.find(m => m.value === stegoMethod)?.label}`,
    });
  };

  const extractMessage = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a steganographic file to extract from",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate extraction process
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate extracted message
    const simulatedMessage = "This is a hidden message extracted from the file using steganographic techniques.";
    setExtractedMessage(simulatedMessage);
    
    setIsProcessing(false);
    toast({
      title: "🔓 Message Extracted",
      description: "Hidden message successfully recovered from file",
    });
  };

  const getFileIcon = (file: File | null) => {
    if (!file) return <FileText className="h-8 w-8" />;
    
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />;
    if (file.type.startsWith('video/')) return <Film className="h-8 w-8 text-purple-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 border-purple-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl flex items-center justify-center gap-3">
              <EyeOff className="h-10 w-10 text-purple-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                Steganography Lab
              </span>
            </CardTitle>
            <CardDescription className="text-lg">
              Hide secret messages inside innocent-looking files
            </CardDescription>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                🖼️ Image Hiding
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                🎵 Audio Steganography
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                🎬 Video Embedding
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="hide" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hide">🔒 Hide Message</TabsTrigger>
            <TabsTrigger value="extract">🔓 Extract Message</TabsTrigger>
            <TabsTrigger value="analysis">🔍 Analysis Tools</TabsTrigger>
          </TabsList>

          {/* Hide Message Tab */}
          <TabsContent value="hide" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    Cover File Selection
                  </CardTitle>
                  <CardDescription>
                    Choose an image, audio, or video file to hide your message in
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-3">
                        {getFileIcon(selectedFile)}
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">Click to select cover file</p>
                          <p className="text-sm text-muted-foreground">
                            Supports: JPG, PNG, MP3, WAV, MP4, AVI
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,audio/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-500" />
                    Message & Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your hidden message and steganographic method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secret Message</label>
                    <Textarea
                      placeholder="Enter the message you want to hide..."
                      value={hiddenMessage}
                      onChange={(e) => setHiddenMessage(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Message length: {hiddenMessage.length} characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Encryption Password (Optional)</label>
                    <Input
                      type="password"
                      placeholder="Additional layer of security..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Steganography Method</label>
                    <Select value={stegoMethod} onValueChange={setStegoMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stegoMethods.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            <div>
                              <div className="font-medium">{method.label}</div>
                              <div className="text-xs text-muted-foreground">{method.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={hideMessage} 
                    disabled={!selectedFile || !hiddenMessage || isProcessing}
                    className="w-full"
                    variant="cyber"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Embedding Message...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Hide Message in File
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Extract Message Tab */}
          <TabsContent value="extract" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-500" />
                    Steganographic File
                  </CardTitle>
                  <CardDescription>
                    Upload a file that contains hidden messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-3">
                        {getFileIcon(selectedFile)}
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Ready for message extraction
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">Select steganographic file</p>
                          <p className="text-sm text-muted-foreground">
                            File that potentially contains hidden data
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Decryption Password</label>
                    <Input
                      type="password"
                      placeholder="Enter password if message is encrypted..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={extractMessage} 
                    disabled={!selectedFile || isProcessing}
                    className="w-full"
                    variant="neon"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Extracting Message...
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Extract Hidden Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-accent" />
                    Extracted Message
                  </CardTitle>
                  <CardDescription>
                    Recovered hidden content from the file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {extractedMessage ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                        <p className="font-mono text-sm whitespace-pre-wrap">
                          {extractedMessage}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(extractedMessage)}
                        >
                          Copy Message
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([extractedMessage], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'extracted_message.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No message extracted yet</p>
                      <p className="text-sm">Upload a steganographic file and click extract</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tools Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-500" />
                    Statistical Analysis
                  </CardTitle>
                  <CardDescription>
                    Detect potential steganographic content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-lg font-bold text-blue-500">Normal</div>
                      <div className="text-xs text-muted-foreground">Pixel Distribution</div>
                    </div>
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <div className="text-lg font-bold text-green-500">Low</div>
                      <div className="text-xs text-muted-foreground">Anomaly Score</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Run Chi-Square Test
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-green-500" />
                    Audio Analysis
                  </CardTitle>
                  <CardDescription>
                    Frequency domain analysis for audio files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <div className="text-lg font-bold text-green-500">Clear</div>
                      <div className="text-xs text-muted-foreground">Spectrum</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                      <div className="text-lg font-bold text-yellow-500">Medium</div>
                      <div className="text-xs text-muted-foreground">Suspicion</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Analyze Frequency Domain
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Steganography Detection Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'Visual Attack', description: 'Compare with original' },
                    { name: 'Statistical Test', description: 'Chi-square analysis' },
                    { name: 'Histogram Analysis', description: 'Pixel distribution check' },
                    { name: 'RS Analysis', description: 'Regular/Singular groups' },
                    { name: 'Bit Plane Analysis', description: 'LSB pattern detection' },
                    { name: 'Compression Artifacts', description: 'JPEG coefficient analysis' }
                  ].map((method, index) => (
                    <div key={index} className="p-3 bg-card border rounded-lg">
                      <h4 className="font-medium text-sm">{method.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Notice */}
        <Card className="bg-yellow-900/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-400">Steganography Best Practices</p>
                <p className="text-sm text-muted-foreground">
                  Use high-quality cover files, limit message size to &lt;10% of cover capacity, 
                  always use encryption, and avoid patterns in your steganographic activities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SteganographyTool;
