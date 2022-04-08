import {
    Button,
    LinearProgress,
    TextField,
    FormGroup,
    Card,
    CardContent,
    CardHeader,
    Typography,
} from "@mui/material";
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

const ArticleCard = ({
    link,
    header,
    text,
}: {
    link: string;
    header: string;
    text: string;
}) => {
    return (
        <a href={link}>
            <Card className="card">
                <CardContent>
                    <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                    >
                        {header}
                    </Typography>
                    <Typography
                        variant="body2"
                        style={{
                            maxHeight: "200px",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}
                    >
                        {text}
                    </Typography>
                </CardContent>
            </Card>
        </a>
    );
};

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
            const shortList = results.documents
                .sort((a: IDocument, b: IDocument) => b.score - a.score)
                .slice(0, 3);
            return (
                <div>
                    <h2>Answer</h2>
                    <p style={{ fontWeight: "bold" }}>{results.answers[0]}</p>
                    <div style={{ display: "flex" }}>
                        <div style={{ flexBasis: "50%", marginRight: "1rem" }}>
                            <h4>Relevant articles</h4>
                            <ul>
                                {shortList.map((doc: IDocument) => {
                                    if ("article_id" in doc.metadata) {
                                        return (
                                            <ArticleCard
                                                link={`${doc.metadata.article_id}#${doc.metadata.header}`}
                                                header={doc.metadata.header}
                                                text={doc.text}
                                            />
                                        );
                                    }
                                })}
                            </ul>
                        </div>
                        <div style={{ flexBasis: "50%" }}>
                            <h4>Relevant videos</h4>
                            <ul>
                                {shortList.map((doc: IDocument) => {
                                    if ("video_id" in doc.metadata) {
                                        return (
                                            <YoutubeEmbed
                                                embedId={doc.metadata.video_id}
                                                offset={Math.round(
                                                    doc.metadata.start
                                                )}
                                            />
                                        );
                                    }
                                })}
                            </ul>
                        </div>
                    </div>
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
            <div style={{ width: "80%", margin: "0px auto" }}>
                <FormGroup row>
                    <TextField
                        required
                        id="outlined"
                        label="What can I help you with?"
                        defaultValue="How do I connect two elements?"
                        value={query}
                        style={{ flexGrow: 1, background: "#1D1E1E" }}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={runQuery}
                        style={{ marginLeft: "1rem" }}
                    >
                        Search
                    </Button>
                </FormGroup>
                {getContent(results)}
            </div>
        </div>
    );
};

export default Home;
