import { Config } from "@remotion/cli/config";

Config.setBrowserExecutable("/opt/pw-browsers/chromium-1243/chrome-linux64/chrome");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setCrf(18); // Auto videos override with --crf=25 in pipeline/make.py
Config.setConcurrency(2);
