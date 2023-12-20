import {
    ArticleWords, Word, Phrase, WordsPhrase,
    Sentence, ExpressionInfo, ExpressionInfoSimple,
    CountInfo, WordCount, Span
} from "./content/interface";

interface RequestUrlParam {
    url: string,
    method: "POST" | "GET",
    body?: string,
    contentType?: string,
}



export default class Api {
    port: number;
    host: string;
    protocol: string;
    prefix: string;
    token: string;

    constructor(host: string, port: number, https: boolean, prefix: string, token?: string) {
        this.host = host;
        this.port = port;
        this.protocol = https ? "https" : "http";
        this.prefix = prefix;
        this.token = token || "";
    }

    async requestUrl(request: RequestUrlParam): Promise<Response> {
        let data = {} as any;
        let res = null as unknown as Response;
        let headers = new Headers();
        headers.set('LR-API-key', this.token);

        if (request.method === "POST") {
            headers.set('Content-Type', 'application/json');
            res = await fetch(request.url, { method: "POST", body: request.body, headers });
        } else {
            res = await fetch(request.url, { method: "GET", headers });
        }
        return res;
    }

    async echo(): Promise<number> {
        let request: RequestUrlParam = {
            url: `${this.protocol}://${this.host}:${this.port}${this.prefix}/echo`,
            method: "GET",
        };

        try {
            let response = await this.requestUrl(request);
            return response.status;
        } catch (e) {
            return 0;
        }
    }
    // // 寻找页面中已经记录过的单词和词组
    // async getStoredWords(
    //     payload: ArticleWords
    // ): Promise<WordsPhrase | undefined> {
    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/word_phrase`,
    //         method: "POST",
    //         body: JSON.stringify(payload),
    //         contentType: "application/json",
    //     };

    //     try {
    //         let response = await requestUrl(request);
    //         let data: WordsPhrase = response.json;
    //         return data;
    //     } catch (e) {
    //         console.warn("Error when getting parse info from server:" + e);
    //     }
    // }

    // 获取单词/词组的详细信息
    async getExpression(
        expression: string
    ): Promise<ExpressionInfo | undefined> {
        let request: RequestUrlParam = {
            url: `${this.protocol}://${this.host}:${this.port}${this.prefix}/word`,
            method: "POST",
            body: JSON.stringify(expression.toLowerCase()),
            contentType: "application/json",
        };

        try {
            let response = await this.requestUrl(request);
            return await response.json();
        } catch (e) {
            console.warn("Error while getting data from server." + e);
        }
    }

    // async getExpressionsSimple(expressions: string[]): Promise<ExpressionInfoSimple[] | undefined> {
    //     expressions = expressions.map(v => v.toLowerCase())
    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/words_simple`,
    //         method: "POST",
    //         body: JSON.stringify(expressions),
    //         contentType: "application/json",
    //     }

    //     try {
    //         let response = await requestUrl(request);
    //         return response.json
    //     } catch (e) {
    //         console.error("Error getting simple data from server: " + e)
    //     }
    // }


    // 获取某一时间之后的所有单词的详细信息
    // async getExpressionAfter(time: string): Promise<ExpressionInfo[] | undefined> {
    //     let unixStamp = moment.utc(time).unix()
    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/words/after`,
    //         method: "POST",
    //         body: JSON.stringify(unixStamp),
    //         contentType: "application/json",
    //     }
    //     try {
    //         let response = await requestUrl(request)
    //         return response.json
    //     } catch (e) {
    //         console.warn("Error getting exprs after time from server" + e)
    //     }
    // }


    // // 通过status查询单词/词组,获取简略信息
    // async getAllExpressionSimple(
    //     ignores?: boolean
    // ): Promise<ExpressionInfoSimple[] | undefined> {
    //     let mode = ignores ? "all" : "no_ignore";

    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/words_simple/${mode}`,
    //         method: "GET",
    //     };

    //     try {
    //         let response = await requestUrl(request);

    //         return response.json;
    //     } catch (e) {
    //         console.warn("Error while getting all simple data from server." + e);
    //     }
    // }

    // 添加或更新单词/词组的信息
    async postExpression(payload: ExpressionInfo): Promise<number | undefined> {
        let request: RequestUrlParam = {
            url: `${this.protocol}://${this.host}:${this.port}${this.prefix}/update`,
            method: "POST",
            body: JSON.stringify(payload),
            contentType: "application/json",
        };
        try {
            let response = await this.requestUrl(request);
            return response.status;
        } catch (e) {
            console.warn("Error while saving data to server." + e);
        }
    }

    // 获取所有的tag
    async getTags(): Promise<string[] | undefined> {
        let request: RequestUrlParam = {
            url: `${this.protocol}://${this.host}:${this.port}${this.prefix}/tags`,
            method: "GET",
        };

        try {
            let response = await this.requestUrl(request);
            return await response.json();
        } catch (e) {
            console.warn("Error getting tags from server." + e);
        }
    }

    // 发送所有忽略的新词
    // async postIgnoreWords(payload: string[]) {
    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/ignores`,
    //         method: "POST",
    //         body: JSON.stringify(payload),
    //         contentType: "application/json",
    //     };

    //     try {
    //         await requestUrl(request);
    //     } catch (e) {
    //         console.warn("Error sending ignore words" + e);
    //     }
    // }

    // // 尝试查询已存在的例句
    // async tryGetSen(text: string): Promise<Sentence | undefined> {
    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/sentence`,
    //         method: "POST",
    //         body: JSON.stringify(text),
    //         contentType: "application/json",
    //     };

    //     try {
    //         let res = await requestUrl(request);
    //         return res.json;
    //     } catch (e) {
    //         console.warn("Error trying to get sentence" + e);
    //     }
    // }

    // // 统计部分
    // // 获取各种类型的单词/词组类型
    // async getCount(): Promise<CountInfo | undefined> {
    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/count_all`,
    //         method: "GET",
    //     };
    //     try {
    //         let response = await requestUrl(request);
    //         let wordsCount: CountInfo = response.json;
    //         return wordsCount;
    //     } catch (e) {
    //         console.warn("Error getting words count" + e);
    //     }
    // }


    // 获取包括今天在内的7天内每一天的新单词量和累计单词量
    // async countSeven(): Promise<WordCount[] | undefined> {
    //     let spans: Span[] = [];

    //     spans = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    //         let start = moment().subtract(6, "days").startOf("day");
    //         let from = start.add(i, "days");
    //         return {
    //             from: from.unix(),
    //             to: from.endOf("day").unix(),
    //         };
    //     });

    //     let request: RequestUrlParam = {
    //         url: `http://${this.host}:${this.port}/count_time`,
    //         method: "POST",
    //         body: JSON.stringify(spans),
    //         contentType: "application/json",
    //     };

    //     try {
    //         let res = await requestUrl(request);
    //         return res.json;
    //     } catch (e) { }
    // }
}