import { Request, Response, NextFunction } from 'express';
import { boardRepo } from '../models/repository/boardRepo';
import { groupRepo } from '../models/repository/groupRepo';
import { boardGroupRepo } from '../models/repository/map-board-group';
import chkChar from '../lib/chkChar';

import { addBoardDto, modifyBoardDto, setBoardFlagDto } from '../interfaces/boardDto';
// import { modifyDto } from '../interfaces/board/modifyDto';
import { boardGroupDto } from '../interfaces/mapping/board-groupDto';
// import { addDto } from '../interfaces/auth/addDto';

const bRepo = new boardRepo();
const gRepo = new groupRepo();
const bgRepo = new boardGroupRepo();

const boardController = {
    // 게시글 추가
    addBoard : async (req: Request, res: Response, next: NextFunction) => {
        const bodyData: addBoardDto = {
            b_writer:   req.body.writer,
            b_title:    req.body.title,
            b_content:  req.body.content,
            b_flag:     0,
            g_name:     req.body.g_name || undefined
        }

        // todo: content 부분만 따로 빼서 escape
        // 파라미터 Check 
        // if(chkChar({bodyData}) === false) {
        //     return next('API002');
        // }

        const result = await bRepo.addBoard(bodyData);
        if(bodyData.g_name !== undefined) {
            // 그룹 존재 여부 확인
            if(await gRepo.findGroupOne(bodyData.g_name) === undefined) {
                return next('API201');
            }

            const mapData: boardGroupDto = {
                b_idx  : result.b_idx,
                g_name : bodyData.g_name
            }
            bgRepo.insertMap(mapData);
        }

        res.json({"message": "처리 완료!"});
    },

    getBoardInfo: async (req: Request, res: Response, next: NextFunction) => {
        const b_idx = req.params.b_idx;

        // 잘못된 파라미터?
        if(chkChar(b_idx) === false) {
            return next('API002');
        }
        
        // Board 찾을 수 있는지 확인
        const result = await bRepo.findBoardOne(parseInt(b_idx, 10));
        if(result === undefined) {  
            return next('API202');
        }

        // 비공개 게시물인지 확인하고, 정상이라면 flag 지움 처리
        if(result.flag === 1) {
            return next('API302');
        } else {
            delete result.flag;
        }
        
        res.json({result, "message": "정상적으로 조회되었습니다."});
    },

    setBoardFlag: async (req: Request, res: Response, next: NextFunction) => {
        const bodyData : setBoardFlagDto = {
            b_idx: req.body.idx,
            b_flag: req.body.state,
        }

        // 잘못된 파라미터?
        if(chkChar(bodyData) === false || bodyData.b_flag in [0, 1, 2] === false ) {
            return next('API002');
        }

        // Board 찾을 수 있는지 확인
        if(await bRepo.findBoardOne(bodyData.b_idx) === undefined) {  
            return next('API202');
        }

        await bRepo.modifyBoardFlag(bodyData);
        res.json({"message": "정상적으로 처리되었습니다."});
    },

    modifyBoard: async (req: Request, res: Response, next: NextFunction) => {
        const bodyData: modifyBoardDto = {
            b_idx:      req.body.idx || 0,
            b_writer:   req.body.writer,
            b_title:    req.body.title,
            b_content:  req.body.content,
            b_flag:     req.body.state,
            g_name:     req.body.g_name || undefined
        }

        // 잘못된 파라미터?
        if(chkChar(bodyData) === false || bodyData.b_flag in [0, 1, 2] === false ) {
            return next('API002');
        }

        // Board 찾을 수 있는지 확인
        if(await bRepo.findBoardOne(bodyData.b_idx) === undefined) {  
            return next('API202');
        }

        if(bodyData.g_name !== undefined) {
            if(await gRepo.findGroupOne(bodyData.g_name) === undefined) {
                return next('API201');
            }

            // 수정: Mapping
            const mapData: boardGroupDto = {
                b_idx  : bodyData.b_idx,
                g_name : bodyData.g_name
            }
            delete bodyData.g_name; // 아래 수정폼을 위해..
            
            bgRepo.deleteMap(mapData);
        }
        // console.log(bodyData)

        // 수정
        await bRepo.modifyBoardInfo(bodyData);

        res.json({"message": "처리 완료!"});

    }
}


export = boardController;