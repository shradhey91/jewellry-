
'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { saveGiftMessagesAction } from './actions';
import { useToast } from '@/hooks/use-toast.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface GiftMessageCategory {
    category: string;
    messages: string[];
}

interface GiftMessageManagerProps {
    initialMessages: GiftMessageCategory[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save All Changes
    </Button>
  );
}

export function GiftMessageManager({ initialMessages }: GiftMessageManagerProps) {
    const [messages, setMessages] = useState<GiftMessageCategory[]>(initialMessages);
    const [state, formAction] = useFormState(saveGiftMessagesAction, { message: '' });
    const { toast } = useToast();

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.message.includes('Failed') ? 'Error' : 'Success',
                description: state.message,
                variant: state.message.includes('Failed') ? 'destructive' : 'default',
            });
        }
    }, [state, toast]);
    
    const handleCategoryNameChange = (index: number, newName: string) => {
        const newMessages = [...messages];
        newMessages[index].category = newName;
        setMessages(newMessages);
    }

    const handleMessagesChange = (index: number, newMessages: string) => {
        const newMessagesArray = newMessages.split('\n');
        const updatedMessages = [...messages];
        updatedMessages[index].messages = newMessagesArray;
        setMessages(updatedMessages);
    }
    
    const addCategory = () => {
        setMessages([...messages, { category: 'New Category', messages: [] }]);
    }
    
    const removeCategory = (index: number) => {
        setMessages(messages.filter((_, i) => i !== index));
    }

    return (
        <form action={formAction}>
            <input type="hidden" name="giftMessages" value={JSON.stringify(messages)} />
            <Card>
                <CardHeader>
                    <CardTitle>Gift Message Suggestions</CardTitle>
                    <CardDescription>
                        Create and manage categories of predefined gift messages that customers can select at checkout.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full space-y-4">
                        {messages.map((cat, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <Card>
                                    <AccordionTrigger className="p-4">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <span className="font-semibold">{cat.category}</span>
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeCategory(index); }}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 space-y-4 border-t">
                                        <div className="space-y-2">
                                            <Label>Category Name</Label>
                                            <Input 
                                                value={cat.category} 
                                                onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Messages (one per line)</Label>
                                            <Textarea
                                                value={cat.messages.join('\n')}
                                                onChange={(e) => handleMessagesChange(index, e.target.value)}
                                                rows={6}
                                            />
                                        </div>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button variant="outline" onClick={addCategory} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    );
}
