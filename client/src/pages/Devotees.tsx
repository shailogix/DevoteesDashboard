import { Header } from "@/components/Layout/Header";
import { DevoteeList } from "@/components/Devotees/DevoteeList";
import { DevoteeGroups } from "@/components/Devotees/DevoteeGroups";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Group } from "lucide-react";

export default function Devotees() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Devotees Management" 
        subtitle="Manage devotee profiles, groups, and spiritual journeys" 
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="devotees" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="devotees" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Devotees</span>
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center space-x-2">
                <Group className="w-4 h-4" />
                <span>Groups</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="devotees">
              <DevoteeList />
            </TabsContent>

            <TabsContent value="groups">
              <DevoteeGroups />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}