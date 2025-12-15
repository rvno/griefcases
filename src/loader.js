import { getAssetPath } from "./utils/asset-path.js";
import gsap from "gsap";

// Get all image paths from the nala folder
const nalaImagePaths = [
  getAssetPath("imgs/nala/00000IMG_00000_BURST20190125134552322_COVER.webp"),
  getAssetPath("imgs/nala/00000PORTRAIT_00000_BURST20191007194801357.webp"),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20190108220720943_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20190121220207728_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20190123182244791_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20190123182252914_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20190126160337666_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20190507172411394_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20190512221959995_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lPORTRAIT_00100_BURST20191001205301423_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lrPORTRAIT_00100_BURST20191120171431575_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lrPORTRAIT_00100_BURST20200225172446894_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lrPORTRAIT_00100_BURST20200414102654101_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lrPORTRAIT_00100_BURST20200615175621804_COVER.webp"
  ),
  getAssetPath(
    "imgs/nala/00100lrPORTRAIT_00100_BURST20200727223427356_COVER.webp"
  ),
  getAssetPath("imgs/nala/01HWCATK17F20WARDCGPQPD1FV-low-res-branded-.webp"),
  getAssetPath("imgs/nala/1960960969680338124.webp"),
  getAssetPath("imgs/nala/8ae6494a19ad790d468d8dcb92296f6d.webp"),
  getAssetPath("imgs/nala/BFA67D5F-C8F2-4604-B551-D6CA52419C37.webp"),
  getAssetPath("imgs/nala/DSC_4385.webp"),
  getAssetPath("imgs/nala/DSC_4430.webp"),
  getAssetPath("imgs/nala/DSC_4444.webp"),
  getAssetPath("imgs/nala/DSC_4480.webp"),
  getAssetPath("imgs/nala/IMG_0025.webp"),
  getAssetPath("imgs/nala/IMG_0026.webp"),
  getAssetPath("imgs/nala/IMG_0027.webp"),
  getAssetPath("imgs/nala/IMG_0032.webp"),
  getAssetPath("imgs/nala/IMG_0033.webp"),
  getAssetPath("imgs/nala/IMG_0042.webp"),
  getAssetPath("imgs/nala/IMG_0247.webp"),
  getAssetPath("imgs/nala/IMG_0369.webp"),
  getAssetPath("imgs/nala/IMG_0627.webp"),
  getAssetPath("imgs/nala/IMG_0750.webp"),
  getAssetPath("imgs/nala/IMG_0751.webp"),
  getAssetPath("imgs/nala/IMG_0756.webp"),
  getAssetPath("imgs/nala/IMG_0757.webp"),
  getAssetPath("imgs/nala/IMG_0785.webp"),
  getAssetPath("imgs/nala/IMG_0810.webp"),
  getAssetPath("imgs/nala/IMG_0835.webp"),
  getAssetPath("imgs/nala/IMG_0851.webp"),
  getAssetPath("imgs/nala/IMG_0859.webp"),
  getAssetPath("imgs/nala/IMG_0867.webp"),
  getAssetPath("imgs/nala/IMG_0868.webp"),
  getAssetPath("imgs/nala/IMG_0880.webp"),
  getAssetPath("imgs/nala/IMG_0883.webp"),
  getAssetPath("imgs/nala/IMG_0888.webp"),
  getAssetPath("imgs/nala/IMG_0890.webp"),
  getAssetPath("imgs/nala/IMG_0932.webp"),
  getAssetPath("imgs/nala/IMG_0936.webp"),
  getAssetPath("imgs/nala/IMG_0971.webp"),
  getAssetPath("imgs/nala/IMG_0976.webp"),
  getAssetPath("imgs/nala/IMG_0977.webp"),
  getAssetPath("imgs/nala/IMG_0978.webp"),
  getAssetPath("imgs/nala/IMG_0982.webp"),
  getAssetPath("imgs/nala/IMG_1007.webp"),
  getAssetPath("imgs/nala/IMG_1155.webp"),
  getAssetPath("imgs/nala/IMG_1237.webp"),
  getAssetPath("imgs/nala/IMG_1302.webp"),
  getAssetPath("imgs/nala/IMG_1315.webp"),
  getAssetPath("imgs/nala/IMG_1358.webp"),
  getAssetPath("imgs/nala/IMG_1385.webp"),
  getAssetPath("imgs/nala/IMG_1386.webp"),
  getAssetPath("imgs/nala/IMG_1401.webp"),
  getAssetPath("imgs/nala/IMG_1467.webp"),
  getAssetPath("imgs/nala/IMG_1480.webp"),
  getAssetPath("imgs/nala/IMG_1485.webp"),
  getAssetPath("imgs/nala/IMG_1508.webp"),
  getAssetPath("imgs/nala/IMG_1512.webp"),
  getAssetPath("imgs/nala/IMG_1530.webp"),
  getAssetPath("imgs/nala/IMG_1549.webp"),
  getAssetPath("imgs/nala/IMG_1566.webp"),
  getAssetPath("imgs/nala/IMG_1567.webp"),
  getAssetPath("imgs/nala/IMG_1583.webp"),
  getAssetPath("imgs/nala/IMG_1594.webp"),
  getAssetPath("imgs/nala/IMG_1607.webp"),
  getAssetPath("imgs/nala/IMG_1618.webp"),
  getAssetPath("imgs/nala/IMG_1627.webp"),
  getAssetPath("imgs/nala/IMG_1715.webp"),
  getAssetPath("imgs/nala/IMG_1719.webp"),
  getAssetPath("imgs/nala/IMG_1730.webp"),
  getAssetPath("imgs/nala/IMG_1738.webp"),
  getAssetPath("imgs/nala/IMG_1743.webp"),
  getAssetPath("imgs/nala/IMG_1766.webp"),
  getAssetPath("imgs/nala/IMG_1767.webp"),
  getAssetPath("imgs/nala/IMG_1813.webp"),
  getAssetPath("imgs/nala/IMG_1834.webp"),
  getAssetPath("imgs/nala/IMG_1846.webp"),
  getAssetPath("imgs/nala/IMG_1855.webp"),
  getAssetPath("imgs/nala/IMG_1907.webp"),
  getAssetPath("imgs/nala/IMG_1924.webp"),
  getAssetPath("imgs/nala/IMG_1952.webp"),
  getAssetPath("imgs/nala/IMG_1954.webp"),
  getAssetPath("imgs/nala/IMG_1961.webp"),
  getAssetPath("imgs/nala/IMG_1963.webp"),
  getAssetPath("imgs/nala/IMG_1964.webp"),
  getAssetPath("imgs/nala/IMG_1966.webp"),
  getAssetPath("imgs/nala/IMG_1981.webp"),
  getAssetPath("imgs/nala/IMG_1988.webp"),
  getAssetPath("imgs/nala/IMG_2012.webp"),
  getAssetPath("imgs/nala/IMG_20181028_015142.webp"),
  getAssetPath("imgs/nala/IMG_20181028_015406.webp"),
  getAssetPath("imgs/nala/IMG_20181028_015411.webp"),
  getAssetPath("imgs/nala/IMG_20181028_015420.webp"),
  getAssetPath("imgs/nala/IMG_20181115_224002.webp"),
  getAssetPath("imgs/nala/IMG_20181116_144400.webp"),
  getAssetPath("imgs/nala/IMG_20181117_160822.webp"),
  getAssetPath("imgs/nala/IMG_20181120_205236.webp"),
  getAssetPath("imgs/nala/IMG_20181121_204355.webp"),
  getAssetPath("imgs/nala/IMG_20181129_235544.webp"),
  getAssetPath("imgs/nala/IMG_20181229_000929.webp"),
  getAssetPath("imgs/nala/IMG_20190103_185400.webp"),
  getAssetPath("imgs/nala/IMG_20190104_001504.webp"),
  getAssetPath("imgs/nala/IMG_20190108_220659.webp"),
  getAssetPath("imgs/nala/IMG_20190115_181020.webp"),
  getAssetPath("imgs/nala/IMG_20190120_131143.webp"),
  getAssetPath("imgs/nala/IMG_20190120_145356.webp"),
  getAssetPath("imgs/nala/IMG_20190121_182435.webp"),
  getAssetPath("imgs/nala/IMG_20190121_191240.webp"),
  getAssetPath("imgs/nala/IMG_20190121_220334.webp"),
  getAssetPath("imgs/nala/IMG_20190125_125310.webp"),
  getAssetPath("imgs/nala/IMG_20190125_134240.webp"),
  getAssetPath("imgs/nala/IMG_20190126_173401.webp"),
  getAssetPath("imgs/nala/IMG_20190127_140254.webp"),
  getAssetPath("imgs/nala/IMG_20190128_121442.webp"),
  getAssetPath("imgs/nala/IMG_20190131_124028.webp"),
  getAssetPath("imgs/nala/IMG_20190201_092355.webp"),
  getAssetPath("imgs/nala/IMG_20190207_191823.webp"),
  getAssetPath("imgs/nala/IMG_20190215_085712.webp"),
  getAssetPath("imgs/nala/IMG_20190218_131442.webp"),
  getAssetPath("imgs/nala/IMG_20190222_165201.webp"),
  getAssetPath("imgs/nala/IMG_20190227_030740.webp"),
  getAssetPath("imgs/nala/IMG_20190305_041624.webp"),
  getAssetPath("imgs/nala/IMG_20190306_030400.webp"),
  getAssetPath("imgs/nala/IMG_20190307_143415.webp"),
  getAssetPath("imgs/nala/IMG_20190315_123016.webp"),
  getAssetPath("imgs/nala/IMG_20190320_140445.webp"),
  getAssetPath("imgs/nala/IMG_20190322_200927.webp"),
  getAssetPath("imgs/nala/IMG_20190325_041003.webp"),
  getAssetPath("imgs/nala/IMG_20190326_190122.webp"),
  getAssetPath("imgs/nala/IMG_20220823_165745_01.webp"),
  getAssetPath("imgs/nala/IMG_20230411_094640_01.webp"),
  getAssetPath("imgs/nala/IMG_20231210_131159_01.webp"),
  getAssetPath("imgs/nala/IMG_2024.webp"),
  getAssetPath("imgs/nala/IMG_20250715_201919.webp"),
  getAssetPath("imgs/nala/IMG_20250716_095632.webp"),
  getAssetPath("imgs/nala/IMG_2028.webp"),
  getAssetPath("imgs/nala/IMG_2030.webp"),
  getAssetPath("imgs/nala/IMG_2031.webp"),
  getAssetPath("imgs/nala/IMG_2048.webp"),
  getAssetPath("imgs/nala/IMG_2073.webp"),
  getAssetPath("imgs/nala/IMG_2087.webp"),
  getAssetPath("imgs/nala/IMG_2092.webp"),
  getAssetPath("imgs/nala/IMG_2104.webp"),
  getAssetPath("imgs/nala/IMG_2107.webp"),
  getAssetPath("imgs/nala/IMG_2115.webp"),
  getAssetPath("imgs/nala/IMG_2125.webp"),
  getAssetPath("imgs/nala/IMG_2131.webp"),
  getAssetPath("imgs/nala/IMG_2145.webp"),
  getAssetPath("imgs/nala/IMG_2148.webp"),
  getAssetPath("imgs/nala/IMG_2156.webp"),
  getAssetPath("imgs/nala/IMG_2160.webp"),
  getAssetPath("imgs/nala/IMG_2162.webp"),
  getAssetPath("imgs/nala/IMG_2163.webp"),
  getAssetPath("imgs/nala/IMG_2164.webp"),
  getAssetPath("imgs/nala/IMG_2168.webp"),
  getAssetPath("imgs/nala/IMG_2172.webp"),
  getAssetPath("imgs/nala/IMG_2174.webp"),
  getAssetPath("imgs/nala/IMG_2175.webp"),
  getAssetPath("imgs/nala/IMG_2181.webp"),
  getAssetPath("imgs/nala/IMG_2188.webp"),
  getAssetPath("imgs/nala/IMG_2189.webp"),
  getAssetPath("imgs/nala/IMG_2192.webp"),
  getAssetPath("imgs/nala/IMG_2194.webp"),
  getAssetPath("imgs/nala/IMG_2198.webp"),
  getAssetPath("imgs/nala/IMG_2207.webp"),
  getAssetPath("imgs/nala/IMG_2208.webp"),
  getAssetPath("imgs/nala/IMG_2214.webp"),
  getAssetPath("imgs/nala/IMG_2239.webp"),
  getAssetPath("imgs/nala/IMG_2242.webp"),
  getAssetPath("imgs/nala/IMG_2245.webp"),
  getAssetPath("imgs/nala/IMG_2252.webp"),
  getAssetPath("imgs/nala/IMG_2259.webp"),
  getAssetPath("imgs/nala/IMG_2282.webp"),
  getAssetPath("imgs/nala/IMG_2297.webp"),
  getAssetPath("imgs/nala/IMG_2300.webp"),
  getAssetPath("imgs/nala/IMG_2359.webp"),
  getAssetPath("imgs/nala/IMG_2387.webp"),
  getAssetPath("imgs/nala/IMG_2400.webp"),
  getAssetPath("imgs/nala/IMG_2406.webp"),
  getAssetPath("imgs/nala/IMG_2485.webp"),
  getAssetPath("imgs/nala/IMG_2491.webp"),
  getAssetPath("imgs/nala/IMG_2492.webp"),
  getAssetPath("imgs/nala/IMG_2515.webp"),
  getAssetPath("imgs/nala/IMG_2522.webp"),
  getAssetPath("imgs/nala/IMG_2550.webp"),
  getAssetPath("imgs/nala/IMG_2627.webp"),
  getAssetPath("imgs/nala/IMG_2644.webp"),
  getAssetPath("imgs/nala/IMG_2659.webp"),
  getAssetPath("imgs/nala/IMG_2669.webp"),
  getAssetPath("imgs/nala/IMG_2670.webp"),
  getAssetPath("imgs/nala/IMG_2784.webp"),
  getAssetPath("imgs/nala/IMG_2865.webp"),
  getAssetPath("imgs/nala/IMG_2939.webp"),
  getAssetPath("imgs/nala/IMG_3103.webp"),
  getAssetPath("imgs/nala/IMG_3104.webp"),
  getAssetPath("imgs/nala/IMG_3901.webp"),
  getAssetPath("imgs/nala/IMG_3916.webp"),
  getAssetPath("imgs/nala/IMG_4123.webp"),
  getAssetPath("imgs/nala/IMG_4224.webp"),
  getAssetPath("imgs/nala/IMG_4246.webp"),
  getAssetPath("imgs/nala/IMG_4256.webp"),
  getAssetPath("imgs/nala/IMG_4259.webp"),
  getAssetPath("imgs/nala/IMG_4280.webp"),
  getAssetPath("imgs/nala/IMG_4330.webp"),
  getAssetPath("imgs/nala/IMG_4331.webp"),
  getAssetPath("imgs/nala/IMG_4433.webp"),
  getAssetPath("imgs/nala/IMG_4451.webp"),
  getAssetPath("imgs/nala/IMG_4736.webp"),
  getAssetPath("imgs/nala/IMG_4738.webp"),
  getAssetPath("imgs/nala/IMG_4816.webp"),
  getAssetPath("imgs/nala/IMG_5075.webp"),
  getAssetPath("imgs/nala/IMG_5076.webp"),
  getAssetPath("imgs/nala/IMG_5099.webp"),
  getAssetPath("imgs/nala/IMG_5388.webp"),
  getAssetPath("imgs/nala/IMG_5915.webp"),
  getAssetPath("imgs/nala/IMG_5932.webp"),
  getAssetPath("imgs/nala/IMG_5933.webp"),
  getAssetPath("imgs/nala/IMG_7760.webp"),
  getAssetPath("imgs/nala/IMG_8793.webp"),
  getAssetPath("imgs/nala/IMG_9404.webp"),
  getAssetPath("imgs/nala/MVIMG_20181218_204211.webp"),
  getAssetPath("imgs/nala/MVIMG_20190119_184619.webp"),
  getAssetPath("imgs/nala/MVIMG_20190119_185740.webp"),
  getAssetPath("imgs/nala/MVIMG_20190120_134810.webp"),
  getAssetPath("imgs/nala/MVIMG_20190121_165023.webp"),
  getAssetPath("imgs/nala/MVIMG_20190124_133416.webp"),
  getAssetPath("imgs/nala/MVIMG_20190503_085550.webp"),
  getAssetPath("imgs/nala/MVIMG_20190513_085322.webp"),
  getAssetPath("imgs/nala/MVIMG_20190529_211350.webp"),
  getAssetPath("imgs/nala/MVIMG_20190605_160010.webp"),
  getAssetPath("imgs/nala/MVIMG_20190624_234347.webp"),
  getAssetPath("imgs/nala/MVIMG_20190628_215902.webp"),
  getAssetPath("imgs/nala/MVIMG_20190630_162722.webp"),
  getAssetPath("imgs/nala/MVIMG_20190704_183051.webp"),
  getAssetPath("imgs/nala/MVIMG_20190729_222451.webp"),
  getAssetPath("imgs/nala/MVIMG_20190826_084241.webp"),
  getAssetPath("imgs/nala/MVIMG_20190920_151251.webp"),
  getAssetPath("imgs/nala/MVIMG_20190921_160457.webp"),
  getAssetPath("imgs/nala/MVIMG_20190921_162940.webp"),
  getAssetPath("imgs/nala/MVIMG_20190925_180819.webp"),
  getAssetPath("imgs/nala/MVIMG_20190926_174906.webp"),
  getAssetPath("imgs/nala/MVIMG_20190926_174909.webp"),
  getAssetPath("imgs/nala/MVIMG_20190926_180117.webp"),
  getAssetPath("imgs/nala/MVIMG_20191015_173205.webp"),
  getAssetPath("imgs/nala/MVIMG_20191107_232624.webp"),
  getAssetPath("imgs/nala/MVIMG_20191107_232627.webp"),
  getAssetPath("imgs/nala/MVIMG_20191121_203708.webp"),
  getAssetPath("imgs/nala/MVIMG_20191202_174714.webp"),
  getAssetPath("imgs/nala/MVIMG_20191211_220230.webp"),
  getAssetPath("imgs/nala/MVIMG_20191214_140559.webp"),
  getAssetPath("imgs/nala/MVIMG_20191214_140614.webp"),
  getAssetPath("imgs/nala/MVIMG_20200103_185851.webp"),
  getAssetPath("imgs/nala/MVIMG_20200104_184215.webp"),
  getAssetPath("imgs/nala/MVIMG_20200109_104113.webp"),
  getAssetPath("imgs/nala/MVIMG_20200109_104157.webp"),
  getAssetPath("imgs/nala/MVIMG_20200115_083013.webp"),
  getAssetPath("imgs/nala/MVIMG_20200120_130419.webp"),
  getAssetPath("imgs/nala/MVIMG_20200122_193116.webp"),
  getAssetPath("imgs/nala/MVIMG_20200122_201836.webp"),
  getAssetPath("imgs/nala/MVIMG_20200211_220529.webp"),
  getAssetPath("imgs/nala/MVIMG_20200220_000505.webp"),
  getAssetPath("imgs/nala/MVIMG_20200313_110430.webp"),
  getAssetPath("imgs/nala/MVIMG_20200317_155146.webp"),
  getAssetPath("imgs/nala/MVIMG_20200320_133717.webp"),
  getAssetPath("imgs/nala/MVIMG_20200326_132527.webp"),
  getAssetPath("imgs/nala/MVIMG_20200502_234101.webp"),
  getAssetPath("imgs/nala/MVIMG_20200516_195026.webp"),
  getAssetPath("imgs/nala/MVIMG_20200612_080032.webp"),
  getAssetPath("imgs/nala/MVIMG_20200622_111637.webp"),
  getAssetPath("imgs/nala/MVIMG_20200622_111711.webp"),
  getAssetPath("imgs/nala/MVIMG_20200707_131739.webp"),
  getAssetPath("imgs/nala/MVIMG_20200806_125017.webp"),
  getAssetPath("imgs/nala/MVIMG_20200806_125347.webp"),
  getAssetPath("imgs/nala/MVIMG_20200808_004200.webp"),
  getAssetPath("imgs/nala/MVIMG_20200910_105809.webp"),
  getAssetPath("imgs/nala/MVIMG_20200910_105845.webp"),
  getAssetPath("imgs/nala/MVIMG_20200913_220941.webp"),
  getAssetPath("imgs/nala/P1010737.webp"),
  getAssetPath("imgs/nala/P1010750.webp"),
  getAssetPath("imgs/nala/P1010757.webp"),
  getAssetPath("imgs/nala/P1010762.webp"),
  getAssetPath("imgs/nala/P1010764.webp"),
  getAssetPath("imgs/nala/P1010769.webp"),
  getAssetPath("imgs/nala/P7040013.webp"),
  getAssetPath("imgs/nala/P7040015.webp"),
  getAssetPath("imgs/nala/P8040003.webp"),
  getAssetPath("imgs/nala/PA040086.webp"),
  getAssetPath("imgs/nala/PXL_20201002_222813058.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201013_194056691.PORTRAIT-01.COVER.webp"),
  getAssetPath("imgs/nala/PXL_20201014_182232370.PORTRAIT-02.ORIGINAL.webp"),
  getAssetPath("imgs/nala/PXL_20201020_044713363.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201021_184828866.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201023_230216589.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201023_232336141.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201023_232901837.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201025_012126082.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201031_204305198.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201103_213516743.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201110_181158327.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201110_181203022.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201114_193823326.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201121_161314141.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201121_161318864.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201128_224638702.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201209_173348242.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201210_000740091.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201226_170706818.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201227_040530057.NIGHT.webp"),
  getAssetPath("imgs/nala/PXL_20201227_060622778.MP.webp"),
  getAssetPath("imgs/nala/PXL_20201228_152842177.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210103_214009703.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210104_205802502.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210107_015910331.NIGHT.webp"),
  getAssetPath("imgs/nala/PXL_20210122_214814191.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210129_010654838.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210129_054300058.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210207_191819732.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210210_054403870.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210214_193524466.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210214_194100186.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210301_175759069.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210306_082934550.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210306_150306815.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210306_151924896.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210311_001234633.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210312_202517663.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210313_091924467.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210319_013117132.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210320_211004149.PANO.webp"),
  getAssetPath("imgs/nala/PXL_20210320_225837667.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210320_232300182.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210320_232523859.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210323_064639019.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210327_184028149.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210407_191356630.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210420_181146513.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210423_180607537.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210423_180610191.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210423_182049409.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210423_182135052.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210423_183108553.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210423_192759038.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210423_192932450.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210428_020527473.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210428_164831843.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210503_052205244.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20210507_181021801.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210509_190416859.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210512_185037003.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210516_212508465.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210519_223713274.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210521_192752165.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210521_204240462.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210523_013103642.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210523_021129818.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210531_221519226.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210531_235151352.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210602_003621271.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210717_022852307.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210724_012354545.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210904_232349773.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210905_000624001.MP.webp"),
  getAssetPath(
    "imgs/nala/PXL_20210905_002043356_exported_699_1681886494344.webp"
  ),
  getAssetPath("imgs/nala/PXL_20210905_220847202.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210905_220925468.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210914_031352638.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210915_062837504.NIGHT.webp"),
  getAssetPath("imgs/nala/PXL_20210915_202848266.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210918_183209310.MP.webp"),
  getAssetPath("imgs/nala/PXL_20210924_061448444.NIGHT.webp"),
  getAssetPath("imgs/nala/PXL_20210924_061648962.NIGHT.webp"),
  getAssetPath("imgs/nala/PXL_20211005_023409897.MP.webp"),
  getAssetPath("imgs/nala/PXL_20211007_055015171.MP.webp"),
  getAssetPath("imgs/nala/PXL_20211008_003706617.MP.webp"),
  getAssetPath("imgs/nala/PXL_20211026_220934133.MP.webp"),
  getAssetPath("imgs/nala/PXL_20211026_221128007.MP.webp"),
  getAssetPath("imgs/nala/PXL_20211130_231842937.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220208_075449306.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220213_022904311.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220309_234826614.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220313_000258613.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20220405_012817303.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220405_015931024.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220511_195824635.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220529_234400331.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20220529_234423099.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20220605_015946293.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220618_201510995.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220629_025050427.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220708_035429455.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20220711_061547024.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220711_191151956.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220723_204903744.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220817_045326857.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220820_182623524.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20220910_230219863.MP.webp"),
  getAssetPath("imgs/nala/PXL_20220921_015744605.MP.webp"),
  getAssetPath("imgs/nala/PXL_20221029_224554465.MP.webp"),
  getAssetPath("imgs/nala/PXL_20221030_000451887.MP.webp"),
  getAssetPath("imgs/nala/PXL_20221030_002106308.PORTRAIT~2.webp"),
  getAssetPath("imgs/nala/PXL_20221114_010402686.MP.webp"),
  getAssetPath("imgs/nala/PXL_20221203_010124206.MP.webp"),
  getAssetPath("imgs/nala/PXL_20221203_010413325.MP 1.webp"),
  getAssetPath("imgs/nala/PXL_20221203_010413325.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230106_213649997.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230106_215417269.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230106_221625844.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230108_084953925.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230109_041650615.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230109_044107569.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230110_011737018.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20230110_011818836.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20230209_034708317.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230210_013721916.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20230302_182208831.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230511_212550413.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230520_015221650.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20230708_224135994.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230819_210906917.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230829_002856310.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230831_174626771.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230906_074430339.NIGHT.webp"),
  getAssetPath("imgs/nala/PXL_20230906_074443666.MP.webp"),
  getAssetPath("imgs/nala/PXL_20230925_180935427.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20230925_180943121.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20230930_191616789.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231005_014324472.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231005_015156640.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231124_165916847.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231129_202130746.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231129_202629682.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231129_203426120.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231129_204025389.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231129_211313097.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20231129_211314661.PORTRAIT.webp"),
  getAssetPath("imgs/nala/PXL_20231206_032254039.MP.webp"),
  getAssetPath("imgs/nala/PXL_20231225_041238059.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240103_203629190.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240103_203939142.PORTRAIT.ORIGINAL.webp"),
  getAssetPath("imgs/nala/PXL_20240115_021607610.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240117_181902145.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240203_012711347.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240203_032726908.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240204_225614009.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240204_225614837.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240216_021325164.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240225_022810983.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240305_171636974.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240410_175949866.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240415_035205001.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240507_044954235.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240514_200041686.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240531_010815624.MP.webp"),
  getAssetPath("imgs/nala/PXL_20240609_182241751.MP.webp"),
  getAssetPath("imgs/nala/Photo on 1-21-18 at 2.53 PM.webp"),
  getAssetPath("imgs/nala/Photo on 12-10-17 at 3.48 PM.webp"),
  getAssetPath("imgs/nala/Screenshot_20190522-075034.webp"),
  getAssetPath("imgs/nala/Screenshot_20190606-200418.webp"),
  getAssetPath(
    "imgs/nala/att.cl5GfmNi91zc8UFIGaX3H0U_gk1obCZ34R4CbqImRUQ.webp"
  ),
  getAssetPath("imgs/nala/received_300199138145485.webp"),
  getAssetPath("imgs/nala/received_360380075417558.webp"),
];

document.addEventListener("DOMContentLoaded", () => {
  const isScrolled = false;

  // Prevent scrolling initially
  document.body.setAttribute("data-lenis-prevent", true);

  const loaderDiv = document.querySelector(".loader");
  if (!loaderDiv) {
    console.error("Loader div not found");
    return;
  }

  const loaderProgress = document.querySelector(".loader__progress");
  const loaderTextBg = loaderProgress.querySelector(".loader__text-bg");
  const loaderTextFg = loaderProgress.querySelector(".loader__text-fg");
  const loaderInstruction = loaderProgress.querySelector(
    ".loader__instruction"
  );
  const mainOverlay = document.querySelector(".main-overlay");

  // Get all logo elements
  const logos = [
    document.querySelector(".logo--g"),
    document.querySelector(".logo--8"),
    document.querySelector(".logo--hourglass"),
    document.querySelector(".logo--infinity"),
  ];

  let loadedCount = 0;
  const totalImages = nalaImagePaths.length;
  let isLoadingComplete = false;

  // Store original positions for final animation
  const originalPositions = logos.map((logo) => {
    const rect = logo.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  });

  // Center of screen
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Initialize: hide all logos and position them at center
  logos.forEach((logo, index) => {
    gsap.set(logo, {
      opacity: 0,
      x: centerX - originalPositions[index].x,
      y: centerY - originalPositions[index].y,
    });
  });

  // Create cycling animation through logos
  let currentLogoIndex = 0;
  const cycleDuration = 1.05; // ~50% longer (was 0.7s, now 1.05s)

  function cycleLogos() {
    if (isLoadingComplete) return;

    const currentLogo = logos[currentLogoIndex];
    const nextIndex = (currentLogoIndex + 1) % logos.length;

    // Fade out current, fade in next with slower, softer easing
    gsap.to(currentLogo, {
      opacity: 0,
      duration: 0.75,
      ease: "sine.inOut",
    });

    gsap.to(logos[nextIndex], {
      opacity: 1,
      duration: 0.75,
      ease: "sine.inOut",
      delay: 0.3,
      onComplete: () => {
        currentLogoIndex = nextIndex;
        cycleLogos();
      },
    });
  }

  // Start the cycling animation
  gsap.to(logos[0], {
    opacity: 1,
    duration: 0.75,
    ease: "sine.out",
    onComplete: () => {
      setTimeout(cycleLogos, cycleDuration);
    },
  });

  // Update loader text fill progress
  function updateLoader() {
    const percentage = (loadedCount / totalImages) * 100;
    const fillPercentage = 100 - percentage;
    loaderTextFg.style.clipPath = `inset(0 ${fillPercentage}% 0 0)`;
  }

  // Load a single image and return a promise
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        loadedCount++;
        updateLoader();
        resolve(src);
      };

      img.onerror = () => {
        loadedCount++;
        updateLoader();
        console.warn(`Failed to load image: ${src}`);
        resolve(src); // Resolve anyway to not block the loader
      };

      img.src = src;
    });
  }

  // Initial state
  updateLoader();

  // Load all images
  const imagePromises = nalaImagePaths.map((path) => loadImage(path));

  Promise.all(imagePromises).then(() => {
    isLoadingComplete = true;

    // Create timeline for exit animation - starts immediately
    const exitTimeline = gsap.timeline({
      onComplete: () => {
        // Allow scrolling now that all images are loaded
        document.body.removeAttribute("data-lenis-prevent");

        // Enable touch scrolling on mobile
        if (window.lenis) {
          window.lenis.start();
        }

        // Check if audio is also loaded, then notify audio manager
        const checkAudioReady = setInterval(() => {
          if (window.audioManager && window.audioManager.isAudioLoaded()) {
            clearInterval(checkAudioReady);
            window.audioManager.setReady(true);
          }
        }, 100);
      },
    });

    // First, fade out all logos from center with dampened easing
    exitTimeline.to(logos, {
      opacity: 0,
      duration: 0.7,
      ease: "sine.in",
    });

    // Add ~1 second pause between exit and re-entrance
    exitTimeline.to({}, { duration: 1.0 });

    // Then fade them back in one by one to their original positions
    // Each shape moves diagonally from center with depth (z-perspective via scale)
    logos.forEach((logo, index) => {
      // Offset amounts based on position from center
      // index 0 (leftmost): 20px right offset (moves from SW to NW)
      // index 1: smaller offset
      // index 2: smaller offset
      // index 3 (rightmost): 20px left offset (moves from SE to NE) - mirrored

      let offsetX, offsetY;

      if (index === 0) {
        // Leftmost: origin from SW (right and down from final position)
        offsetX = 20;
        offsetY = 15;
      } else if (index === 1) {
        // Second: smaller offset from S
        offsetX = 8;
        offsetY = 10;
      } else if (index === 2) {
        // Third: smaller offset from S (mirroring second)
        offsetX = -8;
        offsetY = 10;
      } else {
        // Rightmost: origin from SE (left and down from final position) - mirrored
        offsetX = -20;
        offsetY = 15;
      }

      exitTimeline.fromTo(
        logo,
        {
          x: offsetX,
          y: offsetY,
          opacity: 0,
          scale: 0.85, // starts slightly smaller to add depth
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2, // slower entrance
          ease: "expo.out",
        },
        index * 0.35 + 1.7 // adjusted timing for 1s pause
      );
    });

    // Fade out loading text (bg and fg)
    exitTimeline.to(
      [loaderTextBg, loaderTextFg],
      {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
      },
      1.4 // start after shapes begin appearing
    );

    // Fade in instruction text
    exitTimeline.to(
      loaderInstruction,
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      },
      2.6 // after all shapes have appeared
    );

    // Fade in navbar
    exitTimeline.to(
      mainOverlay,
      {
        opacity: 1,
        duration: 1.0,
        ease: "power2.out",
        onStart: () => {
          mainOverlay.style.pointerEvents = "auto";
        },
      },
      2.8 // slightly after instruction text starts
    );
  });
});
