
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Unlock, Key, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EncryptionService } from "@/lib/encryption";

export function EncryptionManager() {
  const [encryptionKey, setEncryptionKey] = useState(EncryptionService.getKey());
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEncrypt = () => {
    const result = EncryptionService.encrypt(inputText, encryptionKey);
    setOutputText(result);
    toast({
      title: "Text Encrypted",
      description: "Text has been successfully encrypted",
    });
  };

  const handleDecrypt = () => {
    const result = EncryptionService.decrypt(inputText, encryptionKey);
    setOutputText(result);
    toast({
      title: "Text Decrypted", 
      description: "Text has been successfully decrypted",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Output copied to clipboard",
    });
  };

  const updateEncryptionKey = () => {
    EncryptionService.setKey(encryptionKey);
    toast({
      title: "Encryption Key Updated",
      description: "New encryption key has been set",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Encryption Manager</h2>
        <p className="text-muted-foreground">Manage encryption keys and test encryption/decryption</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Encryption Key Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="encryptionKey">Current Encryption Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="encryptionKey"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Enter encryption key"
                />
                <Button onClick={updateEncryptionKey}>
                  Update Key
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current key: <Badge variant="outline">{encryptionKey}</Badge>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encryption/Decryption Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="encrypt" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
              <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="encrypt" className="space-y-4">
              <div>
                <Label htmlFor="encryptInput">Text to Encrypt</Label>
                <Textarea
                  id="encryptInput"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to encrypt (e.g., Unique Member ID)"
                  rows={3}
                />
              </div>
              <Button onClick={handleEncrypt} className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                Encrypt Text
              </Button>
            </TabsContent>
            
            <TabsContent value="decrypt" className="space-y-4">
              <div>
                <Label htmlFor="decryptInput">Encrypted Text to Decrypt</Label>
                <Textarea
                  id="decryptInput"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter encrypted text to decrypt"
                  rows={3}
                />
              </div>
              <Button onClick={handleDecrypt} className="w-full">
                <Unlock className="w-4 h-4 mr-2" />
                Decrypt Text
              </Button>
            </TabsContent>
          </Tabs>

          {outputText && (
            <div className="mt-4 space-y-2">
              <Label>Output Result</Label>
              <div className="relative">
                <Textarea
                  value={outputText}
                  readOnly
                  rows={3}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unique ID Format Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Format: MCDDMMYYYYLTD</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>MC:</strong> 2-digit Mandal Code (e.g., AY, DW, GP)</li>
                <li><strong>DDMMYYYY:</strong> Date of Birth in Day-Month-Year format</li>
                <li><strong>LTD:</strong> Last Three Digits of mobile number</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Example:</h4>
              <p className="text-sm">
                DOB: 15/03/1990, Mandal: Ayodhya (AY), Mobile: 9876543210
                <br />
                <Badge variant="outline" className="mt-1">Result: AY15031990210</Badge>
              </p>
            </div>
            <div>
              <h4 className="font-semibold">QR Encryption Logic:</h4>
              <p className="text-sm text-muted-foreground">
                The Unique ID is encrypted using XOR cipher with the key "JAISHRIMADHAV" and then encoded in Base64 for safe storage and QR code generation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
