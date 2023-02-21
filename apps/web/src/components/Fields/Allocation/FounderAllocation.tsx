import { addAddressButton } from '../styles.css'
import { Heading, Button, Flex, Text, Paragraph, Stack } from '@zoralabs/zord'
import { Icon } from 'src/components/Icon'
import { FormikErrors, FormikProps, FormikTouched } from 'formik'
import React from 'react'
import SmartInput from '../SmartInput'
import DatePicker from '../Date'
import { FounderAllocationFormValues } from 'src/pages/create/forms/Allocation/Allocation'
import { allocationProps, auctionSettingsProps } from 'src/typings'
import { toSeconds } from 'src/utils/helpers'

interface FounderAllocationFieldsProps {
  values: FounderAllocationFormValues
  auctionDuration: auctionSettingsProps['auctionDuration']
  vetoPower?: number
  errors?: FormikErrors<FounderAllocationFormValues>
  touched: FormikTouched<FounderAllocationFormValues>
  formik: FormikProps<FounderAllocationFormValues>
  removeFounderAddress: (index: number) => void
  addFounderAddress: () => void
}

const FounderAllocationFields = ({
  values,
  vetoPower,
  auctionDuration,
  errors,
  touched,
  formik,
  removeFounderAddress,
  addFounderAddress,
}: FounderAllocationFieldsProps) => {
  const calculateMaxAllocation = (
    allocation: string | number,
    end: string | number,
    auctionDuration: auctionSettingsProps['auctionDuration']
  ) => {
    const auctionDurationInSeconds = toSeconds(auctionDuration)
    const endDate = new Date(end).getTime()
    const now = new Date().getTime()
    const diffInSeconds = Math.abs((endDate - now) / 1000)
    const frequency = Number(allocation)
    const numberOfAuctionsTilEndDate = diffInSeconds / auctionDurationInSeconds

    return Math.floor(numberOfAuctionsTilEndDate * (frequency / 100))
  }

  return (
    <Flex position={'relative'} direction={'column'} w={'100%'}>
      <Heading size="xs">Token Allocation</Heading>

      <Paragraph color="text3" mb={'x6'}>
        A Founder Address will receive x% of tokens until the specified end date.
      </Paragraph>

      <Stack>
        {values.founderAllocation.map((founder, index) => {
          const isFounder = index === 0

          const error = errors?.founderAllocation?.[
            index
          ] as FormikErrors<allocationProps>

          const touchedField = touched?.founderAllocation?.[index]

          return (
            <Flex key={`founder-${index}`} direction="column" mb={'x4'}>
              <Flex>
                <Flex style={{ flex: '2 1 0' }}>
                  <SmartInput
                    inputLabel={
                      isFounder
                        ? 'Admin founder address'
                        : 'Additional founder allocations'
                    }
                    id={`founderAllocation.${index}.founderAddress`}
                    value={founder.founderAddress}
                    type={'text'}
                    formik={formik}
                    placeholder={'0x... or .eth'}
                    disabled={isFounder}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoSubmit={false}
                    isAddress={true}
                    errorMessage={
                      error?.founderAddress && touchedField?.founderAddress
                        ? error?.founderAddress
                        : undefined
                    }
                  />
                </Flex>

                <Flex style={{ flex: '1 1 0' }}>
                  <SmartInput
                    inputLabel={'Percentage'}
                    id={`founderAllocation.${index}.allocation`}
                    value={founder.allocation}
                    type={'number'}
                    formik={formik}
                    disabled={false}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    perma={'%'}
                    autoSubmit={false}
                    isAddress={false}
                    errorMessage={
                      error?.allocation && touchedField?.allocation
                        ? error?.allocation
                        : undefined
                    }
                  />
                </Flex>

                <Flex style={{ flex: '1 1 0' }}>
                  <DatePicker
                    id={`founderAllocation.${index}.endDate`}
                    value={founder.endDate}
                    placeholder={'yyyy-mm-dd'}
                    inputLabel={'End date'}
                    formik={formik}
                    autoSubmit={false}
                    disabled={false}
                    errorMessage={
                      error?.endDate && touchedField?.endDate ? error?.endDate : undefined
                    }
                  />
                </Flex>
              </Flex>

              <Flex align={'center'} justify={'space-between'} style={{ marginTop: -24 }}>
                {!isFounder && (
                  <Button
                    type="button"
                    variant="unset"
                    onClick={() => removeFounderAddress(index)}
                  >
                    <Icon id="trash" />
                  </Button>
                )}

                {isFounder && vetoPower === 0 && (
                  <Flex align={'center'} color="warning">
                    <Icon size="sm" id="warning-16" fill="warning" />
                    <Flex fontWeight={'display'} ml={'x2'}>
                      This address has proposal veto power
                    </Flex>
                  </Flex>
                )}

                {founder?.allocation && founder?.endDate && (
                  <Text variant="eyebrow" ml={'auto'}>
                    ~{' '}
                    {calculateMaxAllocation(
                      founder?.allocation,
                      founder?.endDate,
                      auctionDuration
                    )}{' '}
                    Tokens
                  </Text>
                )}
              </Flex>
            </Flex>
          )
        })}
      </Stack>

      <Flex align={'center'} justify={'center'}>
        <Icon id="plus" />
        <Flex ml={'x2'} className={[addAddressButton]} onClick={addFounderAddress}>
          Add Address
        </Flex>
      </Flex>
    </Flex>
  )
}

export default FounderAllocationFields
