
import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
}

interface KnowledgeBasePanelProps {
  articles: Article[];
  onCopyLink: (id: number) => void;
}

const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({ articles, onCopyLink }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxInitialArticles = 3;
  
  const displayedArticles = isExpanded ? articles : articles.slice(0, maxInitialArticles);
  const hasMoreArticles = articles.length > maxInitialArticles;

  return (
    <div className="bg-white rounded-md border border-gray-200 flex flex-col h-1/3">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium">Knowledge Base</h3>
        {hasMoreArticles && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                <span>Show More</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <Accordion type="single" collapsible className="w-full">
          {displayedArticles.map((article) => (
            <AccordionItem key={article.id} value={`item-${article.id}`}>
              <AccordionTrigger className="px-3 text-sm py-2 hover:no-underline hover:bg-gray-50">
                <div className="flex justify-between w-full items-center pr-2">
                  <span className="text-left">{article.title}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{article.category}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="text-xs whitespace-pre-wrap text-gray-700">{article.content}</div>
                <button 
                  className="mt-2 flex items-center text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => onCopyLink(article.id)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Link
                </button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default KnowledgeBasePanel;
