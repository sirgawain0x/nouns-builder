import { Box, Flex, Grid, Heading, Text } from '@zoralabs/zord'
import { getFetchableUrl } from 'ipfs-service'
import Image from 'next/legacy/image'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import useSWR from 'swr'
import { Address, useBalance, useContractReads } from 'wagmi'

import { Avatar } from 'src/components/Avatar/Avatar'
import SWR_KEYS from 'src/constants/swrKeys'
import { metadataAbi, tokenAbi } from 'src/data/contract/abis'
import { SDK } from 'src/data/subgraph/client'
import { proposalDescription } from 'src/modules/proposal'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import {
  about,
  daoInfo,
  daoName,
  statistic,
  statisticContent,
} from 'src/styles/About.css'
import { unpackOptionalArray } from 'src/utils/helpers'
import { formatCryptoVal } from 'src/utils/numbers'

import { useDaoStore } from '../../stores'
import { parseContractURI } from '../../utils'
import { MembersList } from '../MembersList'
import { ExternalLinks } from './ExternalLinks'
import { Founder } from './Founder'
import { Statistic } from './Statistic'

export const About: React.FC = () => {
  const {
    addresses: { token, treasury, metadata },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const { isMobile } = useLayoutStore()

  const tokenContractParams = {
    abi: tokenAbi,
    address: token as Address,
    chainId: chain.id,
  }
  const metadataContractParams = {
    abi: metadataAbi,
    address: metadata as Address,
    chainId: chain.id,
  }

  const { data: contractData } = useContractReads({
    allowFailure: false,
    contracts: [
      { ...tokenContractParams, functionName: 'name' },
      { ...tokenContractParams, functionName: 'totalSupply' },
      { ...tokenContractParams, functionName: 'getFounders' },
      { ...metadataContractParams, functionName: 'contractImage' },
      { ...metadataContractParams, functionName: 'description' },
      { ...metadataContractParams, functionName: 'contractURI' },
    ] as const,
  })

  const [name, totalSupply, founders, daoImage, description, contractURI] =
    unpackOptionalArray(contractData, 6)
  const parsedContractURI = parseContractURI(contractURI)

  const { data: balance } = useBalance({
    address: treasury as Address,
    chainId: chain.id,
  })

  const { data } = useSWR(
    chain && token ? [SWR_KEYS.DAO_INFO, chain.id, token] : null,
    async (_, chainId, token) => {
      const res = await SDK.connect(chainId)
        .daoInfo({
          tokenAddress: token.toLowerCase(),
        })
        .then((x) => x.dao)

      return {
        ownerCount: res?.ownerCount,
      }
    }
  )

  const treasuryBalance = React.useMemo(() => {
    return balance?.formatted ? formatCryptoVal(balance?.formatted) : null
  }, [balance])

  const daoImageSrc = React.useMemo(() => {
    return daoImage ? getFetchableUrl(daoImage) : null
  }, [daoImage])

  const correctedDescription = React.useMemo(() => {
    if (typeof description === 'string') {
      return description.replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    }
  }, [description])

  return (
    <Box className={about}>
      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        align="center"
        justify={{ '@initial': 'flex-start', '@768': 'space-between' }}
      >
        <Flex align="center" justify="flex-start" w="100%">
          {daoImageSrc ? (
            <Box mr="x4">
              <Image
                src={daoImageSrc}
                layout="fixed"
                objectFit="contain"
                style={{ borderRadius: '100%' }}
                alt=""
                height={52}
                width={52}
              />
            </Box>
          ) : (
            <Box mr="x4" borderRadius="phat">
              <Avatar address={token ?? undefined} size="52" />
            </Box>
          )}
          <Text className={daoName}>{name}</Text>
        </Flex>

        <Box display={{ '@initial': 'none', '@768': 'block' }}>
          <ExternalLinks links={{ website: parsedContractURI?.external_url }} />
        </Box>
      </Flex>

      <Flex
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        gap={{ '@initial': 'x2', '@768': 'x4' }}
        overflowX="scroll"
        wrap={'wrap'}
        className={daoInfo}
      >
        <Statistic
          title="Treasury"
          content={`${treasuryBalance} ETH`}
          address={treasury}
        />
        <Statistic title="Owners" content={data?.ownerCount} />
        <Statistic title="Total supply" content={Number(totalSupply)} />
        <Box className={statistic} width={'100%'}>
          <Text color="tertiary">Chain</Text>
          <Flex align={'center'} mt={{ '@initial': 'x1', '@768': 'x3' }}>
            <Box mr="x2">
              <Image src={chain.icon} alt={chain.name} height={28} width={28} />
            </Box>
            <Text fontWeight={'display'} className={statisticContent}>
              {chain.name}
            </Text>
          </Flex>
        </Box>
      </Flex>

      {typeof correctedDescription === 'string' ? (
        <Box mt={{ '@initial': 'x4', '@768': 'x6' }}>
          <ReactMarkdown
            className={proposalDescription}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => {
                return (
                  <Heading size={'xl'} mb={'x6'} mt={'x6'}>
                    {props.children}
                  </Heading>
                )
              },
              h2: ({ node, ...props }) => {
                return (
                  <Heading size={'lg'} mb={'x4'} mt={'x4'}>
                    {props.children}
                  </Heading>
                )
              },
              h3: ({ node, ...props }) => {
                return <Heading size={'md'}>{props.children} </Heading>
              },
              p: ({ node, ...props }) => {
                return <Text mb="x2">{props.children}</Text>
              },
            }}
          >
            {correctedDescription}
          </ReactMarkdown>
        </Box>
      ) : null}

      <Box
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        display={{ '@initial': 'block', '@768': 'none' }}
      >
        <ExternalLinks links={{ website: parsedContractURI?.external_url }} />
      </Box>
      <Text variant="heading-xs" mt="x16" style={{ fontWeight: 800 }}>
        Founders
      </Text>

      {founders && founders?.length > 0 ? (
        <Grid columns={isMobile ? 1 : 2} mt="x6" gap="x4">
          {founders
            .filter((founder) => founder.ownershipPct > 0)
            .map((founder) => (
              <Founder key={founder.wallet} {...founder} />
            ))}
        </Grid>
      ) : (
        <Text mt="x2" color="text3">
          No founders allocation set.
        </Text>
      )}
      <MembersList totalSupply={Number(totalSupply)} ownerCount={data?.ownerCount} />
    </Box>
  )
}
