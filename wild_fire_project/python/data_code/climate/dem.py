import glob
import rasterio
from rasterio.merge import merge

tile_paths = glob.glob('/mnt/data/raw/dem/*.tif')
src_files = [rasterio.open(p) for p in tile_paths]
mosaic, out_transform = merge(src_files)
out_meta = src_files[0].meta.copy()
out_meta.update({
    "driver": "GTiff",
    "height": mosaic.shape[1],
    "width": mosaic.shape[2],
    "transform": out_transform
})
with rasterio.open('/mnt/data/processed/dem/gangwon_dem_merged.tif', 'w', **out_meta) as dst:
    dst.write(mosaic)
