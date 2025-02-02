import { VerifiedUserRounded } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Typography,
  svgIconClasses,
  useTheme,
} from '@mui/material'
import { memo, useEffect, useRef, useState } from 'react'

import { client } from '../api'
import { isAudioTrack, isVideoTrack, stringToColor } from '../utils'
import AudioWave from './AudioWave'
import NetworkIcon from './NetworkIcon'
import VideoBox from './VideoBox'
import { RemoteUser, refStore } from '../features/roomSlice'

type UserBoxProps = {
  user: RemoteUser
} & (typeof Box extends (props: infer Props) => any ? Props : never)

const UserBox = memo(({ user, sx }: UserBoxProps) => {
  const userTracks = refStore.queryRemoteTracks(user.trackIds)
  const videoTracks = userTracks.filter(isVideoTrack)
  const audioTracks = userTracks.filter(isAudioTrack)

  const icon = (
    <VerifiedUserRounded
      sx={{
        marginInline: '0 4px !important',
      }}
    />
  )

  const color = stringToColor(user.userID) + '80'
  const bgcolor = stringToColor(user.userID)

  const [networkQuality, setNetworkQuality] = useState(
    client.getUserNetworkQuality(user.userID),
  )

  const updateInterval = 3000
  useEffect(() => {
    const timer = setInterval(() => {
      const quality = client.getUserNetworkQuality(user.userID)
      setNetworkQuality(quality)
    }, updateInterval)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const theme = useTheme()
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (boxRef.current) {
      if (audioTracks) {
        for (const t of audioTracks) {
          t.play(boxRef.current)
        }
      }
    }
  }, [boxRef.current, audioTracks])

  return (
    <Box
      ref={boxRef}
      sx={{
        display: 'flex',
        position: 'relative',
        border: 'InactiveBorder 2px solid',
        marginInline: 0.2,
        '& audio': {
          display: 'none',
        },
        ...sx,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          position: 'absolute',
          // width: 'calc(100% - 2ch)',
          width: '-webkit-fill-available',
          // margin: '4px',
          padding: 0.5,
          bottom: 0,
          zIndex: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          mixBlendMode: 'hard-light',
          transitionDuration: '0.2s',
          [`&>.${svgIconClasses.root}`]: {
            fontSize: 'inherit',
            verticalAlign: 'middle',
            marginInline: '4px',
          },
          bgcolor: '#00000060',
          ':hover': {
            color: 'whitesmoke',
            bgcolor: '#000000cc',
          },
        }}
      >
        {icon}
        {user.userID}
        <NetworkIcon quality={networkQuality} />
      </Typography>
      {videoTracks.length == 0 && audioTracks.length == 0 ? (
        <Avatar
          sx={{
            margin: 'auto',
            bgcolor,
            color,
            textTransform: 'uppercase',
            '&>span': {
              fontSize: '80%',
              color: '#fff',
              mixBlendMode: 'hard-light',
            },
          }}
          children={<span>{user.userID.slice(0, 2)}</span>}
        />
      ) : undefined}
      {...videoTracks.map((track, i) => {
        return (
          <VideoBox
            key={user.userID + 'v' + i}
            videoTrack={track}
            sx={{
              width: '240px',
              height: '180px',
            }}
          ></VideoBox>
        )
      })}
      {...videoTracks.length == 0
        ? audioTracks.map((track, i) => {
            return (
              <AudioWave
                key={user.userID + 'a' + i}
                track={track}
                width={240}
                height={180}
              />
            )
          })
        : []}
    </Box>
  )
})

export default UserBox
