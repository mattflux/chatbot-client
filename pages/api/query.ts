// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import getResponse from "../../answers";

type Data = {
    answers: any;
    documents: any;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    getResponse(req.body.query).then(data => {
        res.status(200).json({ answers: data?.data?.answers, documents: data?.data?.selected_documents });
    })
}
