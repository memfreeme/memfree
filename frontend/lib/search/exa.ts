import Exa from 'exa-js';
import { SearchOptions, SearchResult, SearchSource } from '@/lib/search/search';
import { TextSource } from '@/lib/types';
import { logError } from '@/lib/log';
import { EXA_API_KEY } from '@/lib/env';

export class EXASearch implements SearchSource {
    private options: SearchOptions;
    private exa: Exa;

    constructor(params?: SearchOptions) {
        this.options = params || {};
        this.exa = new Exa(EXA_API_KEY);
    }

    async search(query: string): Promise<SearchResult> {
        try {
            const category = this.options.categories[0];
            const result = await this.exa.searchAndContents(query, {
                numResults: 10,
                category: category,
                type: 'neural',
                useAutoprompt: true,
            });
            const texts: TextSource[] = result.results.map((c: any) => {
                return {
                    title: c.author,
                    url: c.url,
                    content: c.text,
                };
            });
            return { texts, images: [] };
        } catch (error) {
            logError(error, 'search-exa');
            return { texts: [], images: [] };
        }
    }
}
