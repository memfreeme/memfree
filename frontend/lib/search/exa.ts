import Exa from 'exa-js';
import { SearchOptions, SearchResult, SearchSource } from '@/lib/search/search';
import { TextSource } from '@/lib/types';
import { logError } from '@/lib/log';

const exa = new Exa(process.env.EXA_API_KEY);

export class EXASearch implements SearchSource {
    private options: SearchOptions;

    constructor(params?: SearchOptions) {
        this.options = params || {};
    }

    async search(query: string): Promise<SearchResult> {
        try {
            const result = await exa.searchAndContents(query, {
                numResults: 10,
                category: this.options.categories[0],
                type: 'neural',
                includeDomains: ['twitter.com', 'x.com'],
                highlights: true,
            });
            let texts: TextSource[] = [];
            texts = texts.concat(
                result.results.map((c: any) => {
                    // Only keep the useful infomation
                    const processedHighlights = c.highlights.map(
                        (highlight: string) => {
                            const index = highlight.indexOf('created_at:');
                            return index !== -1
                                ? highlight.substring(0, index).trim()
                                : highlight;
                        },
                    );
                    return {
                        title: c.author,
                        url: c.url,
                        content: processedHighlights.join('\n'),
                    };
                }),
            );
            return { texts, images: [] };
        } catch (error) {
            logError(error, 'search-exa');
            return { texts: [], images: [] };
        }
    }
}
