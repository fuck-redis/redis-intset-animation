import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setVideoPixelFormat('yuva444p');
Config.setOverwriteOutput(true);

Config.setEntryPoint('./src/videos/index.ts');
