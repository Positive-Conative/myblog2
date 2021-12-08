import { Request, Response, NextFunction } from 'express';
import { groupRepo } from '../models/repository/groupRepo';
import chkChar from '../lib/chkChar';

import { addDto } from '../interfaces/groupDto';

const gRepo = new groupRepo();
const groupController = {
    // 그룹 추가
    addGroup : async (req: Request, res: Response, next: NextFunction) => {
        const bodyData: addDto = {
            g_name: req.body.groupName,
            g_memo: req.body.groupMemo,
            g_flag: 0
        }

        // 파라미터 Check
        if(chkChar(bodyData) === false) {
            return next('API002');
        }

        // 그룹 중복 여부 확인
        if(await gRepo.findGroupOne(bodyData.g_name)) {
            return next('API101');
        }

        await gRepo.addGroup(bodyData);
        res.json({"message": "처리 완료!"});
    },

    getGroupInfo: async(req: Request, res: Response, next: NextFunction) => {
        const g_name = req.body.groupName;

         // 잘못된 파라미터?
        if(chkChar(g_name) === false) {
            return next('API002');
        }

        // 그룹 찾을 수 있는지 확인
        const result = await gRepo.findGroupOne(g_name);
        if(result === undefined) {  
            return next('API201');
        }

        // 비공개 그룹인지 확인하고, 정상이라면 flag 지움 처리
        if(result.flag === 1) {
            return next('API301');
        } else {
            delete result.flag;
        }
        
        res.json({result, "message": "정상적으로 조회되었습니다."});
    },

    setGroupFlag: async(req: Request, res: Response, next: NextFunction) => {
        const bodyData : addDto = {
            g_name: req.body.groupName,
            g_flag: req.body.state,
        }

        // 잘못된 파라미터?
        if(chkChar(bodyData) === false || bodyData.g_flag in [0, 1, 2] === false ) {
            return next('API002');
        }

        // 그룹 찾을 수 있는지 확인
        const result = await gRepo.findGroupOne(bodyData.g_name);
        if(result === undefined) {  
            return next('API201');
        }

        await gRepo.modifyGroupFlag(bodyData);
        res.json({"message": "정상적으로 처리되었습니다."});
    },

    modifyGroup: async(req: Request, res: Response, next: NextFunction) => {
        const bodyData: addDto = {
            g_name: req.body.groupName,
            g_memo: req.body.groupMemo,
            g_flag: req.body.state || -1,
        }

        // 잘못된 파라미터?
        if(chkChar(bodyData) === false || bodyData.g_flag in [0, 1, 2] === false ) {
            return next('API002');
        }

        // 그룹 찾을 수 있는지 확인
        const result = await gRepo.findGroupOne(bodyData.g_name);
        if(result === undefined) {  
            return next('API201');
        }
        

        await gRepo.modifyGroupInfo(bodyData);
        res.json({"message": "정상적으로 처리되었습니다."});
    }
}


export = groupController;