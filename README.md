# path_vis

Visualize a sequence of 4x4 transformation matrices as a 3D path inside Jupyter notebooks.

This is useful for visualizing continuous structures like tendons, where each matrix represents a sampled frame along the shape, and the widget connects those frames into a smooth 3D curve.

[![Jupyterlite](https://jupyterlite.rtfd.io/en/latest/_static/badge.svg)](https://matthewandretaylor.github.io/path_vis/lab?path=example_continuum.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/MatthewAndreTaylor/path_vis/blob/main/example_continuum.ipynb)

![path_visualization](https://github.com/user-attachments/assets/c5f25afb-a765-4394-b58d-67c1fe87f0cc)

<details>
  <summary>demo video</summary>

  [path_visualization.webm](https://github.com/user-attachments/assets/63bf923c-5546-4dba-8dc5-0b47ef800fed)
</details>

## Quick Start

```bash
pip install path_vis
```

```python
import numpy as np
from path_vis import PathVis

# Two poses forming a path:
# - Identity transform at the origin
# - Translated 0.2 units in x and 0.1 units in y
path = np.concatenate([
    np.eye(4).ravel(),
    np.array([
        [1, 0, 0, 0.2],
        [0, 1, 0, 0.1],
        [0, 0, 1, 0.0],
        [0, 0, 0, 1.0],
    ]).ravel(),
]).tolist()

# Target coordinate frame at the origin
target_xform = np.eye(4).ravel().tolist()

PathVis(path, target_xform)
```

`PathVis` visualizes a trajectory defined by a sequence of 4×4 homogeneous transformation matrices.

### Parameters

- `path` (`list[float]`, required):

  Flattened list of one or more 4×4 homogeneous transforms describing the trajectory. Each transform must contain exactly 16 floats. Matrices must be flattened in row-major order, which matches `numpy.ravel()` by default. At least two transforms are required to render a visible path.

- `target_xform` (`list[float]`, optional):

  Flattened 4×4 homogeneous transform used to visualize a target coordinate frame with a small axis helper. The transform must contain exactly 16 floats in row-major order. If omitted, no target frame is rendered.



## Widget Interaction

- Left mouse drag: pan
- Right mouse drag: rotate
- Scroll wheel: zoom

## Examples

The repository includes two notebooks with working examples:

- [example_basic.ipynb](example_basic.ipynb)
- [example_continuum.ipynb](example_continuum.ipynb)