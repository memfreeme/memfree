import { DemoQuestions } from '@/components/search/demo-questions';
import { Textarea } from '@/components/ui/textarea';

export default function SearchWindowFallBack() {
    return (
        <div className="group overflow-auto mx-auto w-full md:w-5/6  px-4 md:px-0 flex flex-col my-2">
            <DemoQuestions />
            <div className="w-full text-center">
                <div className="flex flex-col relative mx-auto w-full border-2 rounded-lg focus-within:border-primary">
                    <Textarea
                        aria-label="Search"
                        className="w-full border-0 bg-transparent p-4 mb-8 text-sm placeholder:text-muted-foreground overflow-y-auto  outline-0 ring-0  focus-visible:outline-none focus-visible:ring-0 resize-none"
                    ></Textarea>
                </div>
            </div>
        </div>
    );
}
