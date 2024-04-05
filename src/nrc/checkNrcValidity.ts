import { nrcTypes, nrcStates, nrcTownships } from "../config/nrc-config.json";

interface Iresponse {
    error: string | null;
    valid: boolean
}

function splitNrcStr(str: string) {
    const [stateNum = "", townshipAndNumStr = ""] = str.split("/");
    const [townshipCode = "", nrcNum = ""] = townshipAndNumStr.split(/\(.*\)/);
    const nrcType = /\(([^)]+)\)/.exec(str)?.[1] ?? "";

    return {
        stateNum,
        townshipCode,
        nrcType,
        nrcNum
    }
}

function checkNrcType(nrcType: string) {
    return nrcTypes.find(item => [item.name.en, item.name.mm].includes(nrcType));
}

function checkNRCStateNo(stateNo: string) {
    return nrcStates.find(item => [item.number.en, item.number.mm].includes(stateNo));
}

function checkNRCTownship(townshipCode: string, stateCode: string) {
    let tspInState = nrcTownships.filter(item => item.stateCode === stateCode);
    return tspInState.find(item => [item.short.mm, item.short.en].includes(townshipCode));
}

export const checkNrcValid = async (nrc_string: string): Promise<Iresponse> => {

    let res: Iresponse = { error: null, valid: true };

    const { stateNum, townshipCode, nrcType, nrcNum } = splitNrcStr(nrc_string);

    if (!(stateNum && townshipCode && nrcType && nrcNum)) {
        res.error = `Invalid NRC format: "${nrc_string}"`;
        return res;
    }

    if (!checkNrcType(nrcType)) {
        res.error = `Invalid NRC type: "${nrcType}"`;
        return res;
    }

    const state = checkNRCStateNo(stateNum);
    if (!state) {
        res.error = `Invalid NRC State Number: "${stateNum}"`;
        return res;
    }

    const township = checkNRCTownship(townshipCode, state.number.en);
    if (!township) {
        res.error = `Invalid NRC township code "${townshipCode}"`;
        return res;
    }

    if (township.stateId !== state.id) {
        res.error = `NRC township code doesn't relate to state number`;
        return res;
    }

    return res
};