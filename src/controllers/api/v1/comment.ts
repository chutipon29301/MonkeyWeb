import { Router } from 'express';
import { CommentText } from '../../../repositories/v1/CommentText';

export const router = Router();

router.post('/listText',
    (req, res) => {
        CommentText.getInstance().list().subscribe(
            (comments) => res.status(200).send({ comments }),
            (error) => res.status(500).send(error),
        );
    },
);
