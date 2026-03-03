export default {
  async render({ model, el }) {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three/+esm");
    const scene = new THREE.Scene();

    const container = document.createElement("div");
    el.appendChild(container);

    const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 1000);
    camera.up.set(0, -1, 0);
    camera.position.set(0, 3, 0.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1000, 800);
    container.appendChild(renderer.domElement);

    const planeSize = 2.0;
    const gridResolution = 20;
    const grid = new THREE.GridHelper(planeSize, gridResolution, 0x4d4d4d, 0x4d4d4d);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    function updateTargetXform() {
      const mt = model.get("target_xform");
      if (mt.length > 0 && mt.length === 16) {
        const mat = new THREE.Matrix4().set(...mt);
        const targetTransform = new THREE.AxesHelper(0.2);
        targetTransform.applyMatrix4(mat);
        targetTransform.name = "targetTransform"; 
        scene.add(targetTransform);
      }
    }

    updateTargetXform();

    model.on("change:target_xform", () => {
      const oldTarget = scene.getObjectByName("targetTransform");
      if (oldTarget) {
        scene.remove(oldTarget);
      }
      updateTargetXform();
    });

    const tubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const tubeMesh = new THREE.Mesh(new THREE.BufferGeometry(), tubeMaterial);
    scene.add(tubeMesh);
    let axesHelpers = [];

    function updatePath(path) {
      const points = [];
      const matrixCount = path.length / 16;

      while (axesHelpers.length < matrixCount) {
        const axes = new THREE.AxesHelper(0.03);
        scene.add(axes);
        axesHelpers.push(axes);
      }

      for (let i = 0; i < matrixCount; i++) {
        const m = path.slice(i * 16, i * 16 + 16);
        const mat4 = new THREE.Matrix4().set(...m);
        points.push(new THREE.Vector3(m[3], m[7], m[11]));
        const axes = axesHelpers[i];
        axes.matrix = mat4;
        axes.matrix.decompose(axes.position, axes.quaternion, axes.scale);
      }

      if (points.length < 2) {
        console.warn("Path must contain at least 2 points to render a tube.");
        return;
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const newGeometry = new THREE.TubeGeometry(curve, 200, 0.005, 50, false);
      tubeMesh.geometry.dispose();
      tubeMesh.geometry = newGeometry;
    }

    updatePath(model.get("path"));

    model.on("change:path", () => {
      updatePath(model.get("path"));
    });

    let isDragging = false;
    let isRotating = false;
    let previousMousePos = { x: 0, y: 0 };
    let target = new THREE.Vector3(0, 0, 0);

    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      const offset = new THREE.Vector3();
      offset.subVectors(camera.position, target);

      const spherical = new THREE.Spherical();
      spherical.setFromVector3(offset);
      const zoomFactor = Math.exp(e.deltaY * 0.001);
      spherical.radius *= zoomFactor;
      spherical.radius = Math.max(0.1, Math.min(100, spherical.radius));

      offset.setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
    });

    renderer.domElement.addEventListener("mousedown", (e) => {
      previousMousePos.x = e.clientX;
      previousMousePos.y = e.clientY;

      if (e.button === 2) {
        isRotating = true;
      } else if (e.button === 0) {
        isDragging = true;
      }
    });

    renderer.domElement.addEventListener("mouseup", (e) => {
      if (e.button === 2) isRotating = false;
      if (e.button === 0) isDragging = false;
    });

    renderer.domElement.addEventListener("mousemove", (e) => {
      const dx = e.clientX - previousMousePos.x;
      const dy = e.clientY - previousMousePos.y;

      if (isDragging) {
        const right = new THREE.Vector3();
        camera.getWorldDirection(right);
        right.cross(camera.up).normalize();
        const up = new THREE.Vector3();
        up.copy(camera.up).normalize();
        target.addScaledVector(right, -dx * 0.005);
        target.addScaledVector(up, dy * 0.005);
        camera.position.addScaledVector(right, -dx * 0.005);
        camera.position.addScaledVector(up, dy * 0.005);
      }

      if (isRotating) {
        const offset = new THREE.Vector3();
        offset.subVectors(camera.position, target);

        const spherical = new THREE.Spherical();
        spherical.setFromVector3(offset);
        spherical.theta -= dx * 0.005;

        spherical.phi -= dy * 0.005;
        spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));

        offset.setFromSpherical(spherical);
        camera.position.copy(target).add(offset);
      }

      previousMousePos.x = e.clientX;
      previousMousePos.y = e.clientY;
    });

    function animate() {
      requestAnimationFrame(animate);
      camera.lookAt(target);
      renderer.render(scene, camera);
    }
    animate();
  }
};
