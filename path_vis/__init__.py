import pathlib
import anywidget
import traitlets
from IPython.display import display


class PathVis(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "main.js"

    path = traitlets.List(traitlets.Float(), default_value=[]).tag(sync=True)

    def __init__(self, path):
        super().__init__()
        assert (
            len(path) % 16 == 0
        ), "Path must be a list of 4x4 matrices (16 floats each)"
        self.path = path

    def render(self):
        display(self)
