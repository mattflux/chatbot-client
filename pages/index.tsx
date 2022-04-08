import { Button, LinearProgress, TextField } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

interface IVideoMetadata {
    start: number;
    video_id: string;
}

interface IArticleMetadata {
    article_id: string;
    header: string;
}

interface IDocument {
    text: string;
    object: "search_result";
    metadata: IVideoMetadata | IArticleMetadata;
    document: number;
    score: number;
}

function getFetcher(url: string, body: any, method: "GET" | "POST") {
    return () =>
        fetch(url, {
            body: JSON.stringify(body),
            method,
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
}

const YoutubeEmbed = ({ embedId, offset }: any) => (
    <div className="video-responsive">
        <iframe
            width="853"
            height="480"
            src={`https://www.youtube.com/embed/${embedId}?start=${offset}&end=${
                offset + 60
            }`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
        />
    </div>
);

const Home: NextPage = () => {
    const [results, setResults] = useState<any>(null);
    const [query, setQuery] = useState("");
    const [isLoading, setLoading] = useState(false);
    const runQuery = useCallback(() => {
        if (isLoading) {
            return;
        }
        setLoading(true);
        getFetcher("/api/query", { query }, "POST")().then((data) => {
            setResults(data);
            setLoading(false);
        });
    }, [query, isLoading]);

    function getContent(results: any) {
        if (isLoading) {
            return <LinearProgress />;
        }
        if (results?.answers?.length) {
            return (
                <div>
                    <p>{results.answers[0]}</p>
                    <ul>
                        {results.documents
                            .sort(
                                (a: IDocument, b: IDocument) =>
                                    b.score - a.score
                            )
                            .slice(0, 3)
                            .map((doc: IDocument) => {
                                if ("article_id" in doc.metadata) {
                                    return (
                                        <li>
                                            <a
                                                href={`${doc.metadata.article_id}#${doc.metadata.header}`}
                                            >
                                                {doc.metadata.header}
                                            </a>
                                        </li>
                                    );
                                } else {
                                    return (
                                        <li>
                                            <YoutubeEmbed
                                                embedId={doc.metadata.video_id}
                                                offset={Math.round(
                                                    doc.metadata.start
                                                )}
                                            />
                                        </li>
                                    );
                                }
                            })}
                    </ul>
                </div>
            );
        }
        return null;
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>AI Jharwin</title>
                <meta name="description" content="It's Jharwin but it's AI" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <TextField
                required
                id="outlined"
                label="What can I help you with?"
                defaultValue="How do I connect two elements?"
                value={query}
                fullWidth
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="contained" onClick={runQuery}>
                Search
            </Button>
            {getContent(results)}
        </div>
    );
};

export default Home;
