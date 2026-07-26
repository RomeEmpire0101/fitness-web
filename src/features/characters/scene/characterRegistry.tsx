import { ComponentType } from "react";
import { CharacterModelId } from "../types";
import {
  CharacterModel,
  CharacterModelProps,
} from "./CharacterModel";

const CHARACTER_MODELS: Record<
  CharacterModelId,
  ComponentType<CharacterModelProps>
> = {
  "adaptive-athlete": CharacterModel,
};

/**
 * New 3D character implementations register here, keeping Canvas setup and the
 * lab UI independent from any one body rig.
 */
export function RegisteredCharacterModel(props: CharacterModelProps) {
  const Model =
    CHARACTER_MODELS[props.profile.modelId] ??
    CHARACTER_MODELS["adaptive-athlete"];
  return <Model {...props} />;
}

