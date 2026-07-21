import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment } from '@react-three/drei';
import { MathUtils, MeshStandardMaterial } from 'three';
import { lipsyncManager } from '../App';

const ANIMATION_FADE_TIME = 0.5;

const wawaToAzureMap = {
    'viseme_sil': 0, 'viseme_PP': 21, 'viseme_FF': 18, 'viseme_TH': 17,
    'viseme_DD': 19, 'viseme_kk': 20, 'viseme_CH': 16, 'viseme_SS': 15,
    'viseme_nn': 19, 'viseme_RR': 13, 'viseme_aa': 2, 'viseme_E': 4,
    'viseme_I': 6, 'viseme_O': 8, 'viseme_U': 7
};

function NanamiAvatar({ avatarState }) {
  const group = useRef();
  const { scene } = useGLTF('/assets/models/Teacher_Nanami.glb');
  const { animations } = useGLTF('/assets/models/animations_Nanami.glb');
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState("Idle");
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    scene.traverse((child) => { if (child.material) child.material = new MeshStandardMaterial({ map: child.material.map }); });
  }, [scene]);

  useEffect(() => {
    if (avatarState === 'thinking') setAnimation("Thinking");
    else if (avatarState === 'talking') setAnimation(Math.random() > 0.5 ? "Talking" : "Talking2");
    else setAnimation("Idle");
  }, [avatarState]);

  useFrame((state) => {
    lerpMorphTarget("mouthSmile", 0.2, 0.5);
    lerpMorphTarget("eye_close", blink ? 1 : 0, 0.5);

    if (avatarState === 'talking') {
      lipsyncManager.processAudio();
      const currentViseme = lipsyncManager.viseme; 

      for (let i = 0; i <= 21; i++) lerpMorphTarget(i, 0, 0.15); 

      if (currentViseme) {
          const formattedViseme = currentViseme.startsWith('viseme_') ? currentViseme : `viseme_${currentViseme}`;
          const azureVisemeId = wawaToAzureMap[formattedViseme];
          if (azureVisemeId !== undefined) lerpMorphTarget(azureVisemeId, 1, 0.4);
      }
      if (actions[animation] && actions[animation].time > actions[animation].getClip().duration - ANIMATION_FADE_TIME) {
        setAnimation((curr) => (curr === "Talking" ? "Talking2" : "Talking"));
      }
    } else {
      for (let i = 0; i <= 21; i++) lerpMorphTarget(i, 0, 0.15); 
    }
  });

  useEffect(() => {
    if (actions[animation]) actions[animation].reset().fadeIn(mixer.time > 0 ? ANIMATION_FADE_TIME : 0).play();
    return () => { if (actions[animation]) actions[animation].fadeOut(ANIMATION_FADE_TIME); };
  }, [animation, actions]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index !== undefined && child.morphTargetInfluences[index] !== undefined) {
          child.morphTargetInfluences[index] = MathUtils.lerp(child.morphTargetInfluences[index], value, speed);
        }
      }
    });
  };

  
  return <primitive ref={group} object={scene} position={[0, -1.7, -1]} scale={1.5} />;
  
}

// At the bottom of AvatarCanvas.jsx
export default function AvatarCanvas({ avatarState }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '450px', background: 'transparent', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas alpha={true} camera={{ position: [0, 0, 1.1], fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[1, 3, 4]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
        <Environment preset="sunset" />
        <Suspense fallback={null}><NanamiAvatar avatarState={avatarState} /></Suspense>
      </Canvas>
    </div>
  );
}