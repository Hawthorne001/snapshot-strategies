import { getAddress } from '@ethersproject/address';
import {  subgraphRequest } from '../../utils';

export const author = 'andreibadea20';
export const version = '0.1.0';

const DPS_SUBGRAPH_URL = {
  '80001': 'https://api.thegraph.com/subgraphs/name/andreibadea20/subgraph-dps'
};


const PAGE_SIZE = 1000;

const params = {
    users: {
        __args: {
            block: {number: 22572401},
            first: PAGE_SIZE,
            skip: 0
        },
        id: true,
        numberOfTokens: true,
        listOfNFTsLocked: {
            tokenId: true
        },
        listOfNFTsReturned: {
            tokenId: true
        }   
    }
};

export async function strategy(space, network, provider, addresses, options, snapshot) {
    
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.users.__args.block = {number: snapshot};
    }

    const score = {};
    let page = 0;

    while (page !== -1) {
        params.users.__args.skip = page * PAGE_SIZE;
        const result = await subgraphRequest(DPS_SUBGRAPH_URL[network], params);
        if (result && result.users) {
            result.users.forEach((u) => {

                const userAddress = getAddress(u.id);

                let userScore = parseInt(u.numberOfTokens);

                let lockedNFTs = u.listOfNFTsLocked.length;
                let claimedNFTs = u.listOfNFTsReturned.length;


                userScore = userScore + lockedNFTs - claimedNFTs;

                if (!score[userAddress])
                    score[userAddress] = 0;
                score[userAddress] = userScore;
            });
            page = result.users.length < PAGE_SIZE ? -1 : page + 1;
        }
        else {
            page = -1;
        }
    }
    return score || {};
    }