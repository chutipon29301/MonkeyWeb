import { Router } from "express";
import { Constant } from "./classes/Constants";
import { FileManager } from "./classes/FileManager";
import { SlideshowManager, SlideshowResponse, SlideshowObject } from "./classes/SlideshowManager";

export const router = Router();

function formatDate(date: Date): Date {
    let newDate = new Date(0);
    newDate.setDate(date.getDate());
    newDate.setMonth(date.getMonth());
    newDate.setFullYear(date.getFullYear());
    return newDate;
}

router.post("/add", (req, res) => {
    if (!(req.files && req.body.date && req.body.type)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    let date = formatDate(new Date(req.body.date));
    FileManager.addSlideshowImage(req.files as Express.Multer.File[], date);
    SlideshowManager.addSlideshows(date, req.body.type, req.files as Express.Multer.File[]).subscribe(slideshows => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.post("/remove", (req, res) => {
    if (!(req.body.fileName && req.body.date)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    let date = formatDate(new Date(req.body.date));
    SlideshowManager.getSlideshow(date, req.body.fileName).flatMap(slideshow => {
        FileManager.removeSlideshowImage(slideshow.path.toString());
        return SlideshowManager.removeSlideshow(slideshow._id);
    }).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    })
});

router.post("/list", (req, res) => {
    if (!(req.body.startDate && req.body.endDate)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    SlideshowManager.listSlideshow(formatDate(new Date(req.body.startDate)), formatDate(new Date(req.body.endDate)), true).subscribe(slideshows => {
        let slideshowResponse: SlideshowResponse[] = [];
        for (let i = 0; i < slideshows.length; i++) {
            slideshowResponse.push(new SlideshowObject(slideshows[i]).getSlideshowResponse());
        }
        return res.status(200).send({ images: slideshowResponse });
    });
});

router.post("/listAll", (req, res) => {
    if (!(req.body.startDate && req.body.endDate)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    SlideshowManager.listAllSlideshow(formatDate(new Date(req.body.startDate)), formatDate(new Date(req.body.endDate))).subscribe(slideshows => {
        let slideshowResponse: SlideshowResponse[] = [];
        for (let i = 0; i < slideshows.length; i++) {
            slideshowResponse.push(new SlideshowObject(slideshows[i]).getSlideshowResponse());
        }
        return res.status(200).send({images: slideshowResponse});
    });
});

router.post("/toggleVisible", (req, res) => {
    if (!(req.body.fileName && req.body.date && req.body.visible)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    SlideshowManager.setVisibility(formatDate(new Date(req.body.date)), req.body.fileName, (req.body.visible == "true")).subscribe(_ => {
        return res.status(200).send({
            msg: "OK"
        });
    });
});

router.get("/img", (req, res) => {
    if (!(req.query.d && req.query.n)) {
        return res.status(400).send({
            err: -1,
            msg: "Bad Request"
        });
    }
    SlideshowManager.getSlideshow(formatDate(new Date(req.query.d)), req.query.n).subscribe(slideshow => {
        return res.status(200).sendFile(slideshow.path.valueOf());
    });
});